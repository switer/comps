'use strict';


var ASTParser = require('block-ast')
var ATTParser = require('attribute-parser')
var util = require('./lib/util')

// debug
// var Tracer = require('debug-trace')
// Tracer({always: true})

function warn() {
	console.log('[COMPS] ' + [].slice.call(arguments).join(' '))
}
/**
 * Comps's config
 */
var _config = {
	openTag: '{%',
	closeTag: '%}'
}
/**
 * Private match regexps or reg-strings
 */
var _open_tag_reg_str = _genRegStr(_config.openTag)
var _close_tag_reg_str = _genRegStr(_config.closeTag)
var _wildcard_reg = _genWildcardReg()
var _block_close_reg = _genBlockCloseReg()
var _self_close_reg = _genSelfCloseReg()
var _trim_reg = _genTrimReg()
/**
 * Interal util methods
 */
function _genRegStr (str) {
	return '\\' + str.split('').join('\\')
}
function _genBlockCloseReg () {
	return new RegExp(_open_tag_reg_str + '/[\\s\\S]+?' + _close_tag_reg_str, 'm')
}
function _genSelfCloseReg () {
	return new RegExp(_open_tag_reg_str + '[\\s\\S]+?/' + _close_tag_reg_str, 'm')
}
function _genWildcardReg () {
	return new RegExp(_open_tag_reg_str + '[\\s\\S]+?' + _close_tag_reg_str, 'gm')
}
function _genTrimReg () {
	return new RegExp('(^' + _open_tag_reg_str + '\\s*|\\s*/?' + _close_tag_reg_str + '$)', 'gm')
}
function _trim(c) {
	return c.replace(_trim_reg, '')
}
function _getTagName(c) {
	return _getTagNameWithoutTrim(_trim(c))
}
function _getTagNameWithoutTrim(c) {
	return c.match(/\S+/)[0]
}
function _getAttributes(c) {
	return _getAttributesWithoutTrim(_trim(c))
}
function _getAttributesWithoutTrim(c) {
	return ATTParser(c)
}
/**
 * Singleton parser instance
 */
var Parser = ASTParser(
	function operator() {
		return _wildcard_reg
	},
	function isSelfCloseTag(tag, ctx) {
		return _self_close_reg.test(tag)
	},
	function isOpenTag(tag, ctx) {
		return !_block_close_reg.test(tag)
	}
)
var componentLoader = noop
var componentTransform = noop
/**
 * Internal variables
 */
var _tags = {
	// build in tags
	pagelet: {
		scope: true,
		block: true,
		created: function () {
			this.tagname = this.$attributes.$tag || 'div'
			var id = this.$attributes.$id
			if (!id) throw new Error('Pagelet tag need specify the "$id" attribute.')
			// pagelet patches
			var patches = this.patches = this.$scope.$patches
			patches.push(id)
			if (this.$scope.$root().$pagelet === patches.join('.')) {
				this.$scope.$shouldRender = true
			}
		},
		render: function () {
			var ctx = this
			var attStr = attributeStringify(this.$attributes)
			return [
				'<' + this.tagname + ' data-pageletid="' + this.patches.join('.') + '"' + (attStr ? ' ' + attStr : '') + '>',
				'</' + this.tagname + '>'
			]
		},
		walk: function () {
			var ctx = this
			return this.$el.childNodes.map(function (n) {
				return ctx.$walk(n, ctx.$scope)
			}).join('')
		}
	},
	component: {
		created: function () {
			this.tagname = this.$attributes.$tag || 'div'
			this.replace = this.$attributes.$replace && this.$attributes.$replace != 'false'
			this.merge = this.$attributes.$replace === 'merge'
			var id = this.id = this.$attributes.$id
			if (!id) throw new Error('Component the "$id" attribute.')

			componentTransform.call(this, id)
		},
		render: function () {
			var ctx = this
			var attStr = attributeStringify(this.$attributes)
			if (this.replace) return ['', '']
			return [
				'<' + this.tagname + (attStr ? ' ' + attStr : '') + '>',
				'</' + this.tagname + '>'
			]
		},
		walk: function () {
			return Comps({
				template: componentLoader.call(this, this.id) || '',
				children: this.$el.childNodes,
				scope: this.$scope,
				attributes: this.replace && this.merge ? this.$attributes : null
			})
		}
	}
}
function Scope(parent, data) {
	data = data || {}
	this.$parent = parent || null

	// using as options
	parent = parent || {}
	// inherit properties
	this.$patches = parent.$patches ? parent.$patches.slice() : []
	this.$shouldRender = hasProp(data, 'shouldRender') 
		? data.shouldRender 
		: !!parent.$shouldRender

	this.$pagelet = data.pagelet || ''
}
Scope.prototype.$root = function () {
	var root = this
	while(root.$parent) {
		root = root.$parent
	}
	return root
}
function Tag(node, isBlock, name, def, raw, scope, walk) {
	if (isBlock && def.block === false) warn('Tag "' + name + '" must be a block tag.')
	if (!isBlock && def.block === true) warn('Tag "' + name + '" must be a self-closing tag.')

	var isScope = !!def.scope
	var created = def.created
	var render = def.render
	var _walk = def.walk
	var ctx = this

	this.$el = node
	this.$raw = raw
	this.$name = name
	this.$attributes = _getAttributesWithoutTrim(raw)

	if (isScope) {
		// create child scope instance
		this.$scope = new Scope(scope)
	} else {
		// inherit parent's scope
		this.$scope = scope
	}
	var $scope = this.$scope
	this.$walk = walk
	this.$render = function () {
		var willRender = $scope.$shouldRender
		var result = willRender ? render.call(ctx) : ['','']
		var walkResult = _walk.call(ctx) || ''
		return result[0] + walkResult + result[1] 
	}
	created && created.call(this)
}
Tag.prototype.render = function () {
	return this.$render()
}
/**
 * Comps module interfaces
 */
function walk(node, scope) {
	var name
	var isBlock = false
	var output = ''
	switch(node.nodeType) {
		// Root
		case 1:
			output += node.childNodes.map(function (n) {
				return walk(n, scope)
			}).join('')
			break
		// Block Tag
		case 2:
			isBlock = true
		// Self-Closing Tag
		case 3:
			var attStr = _trim(isBlock ? node.openHTML : node.outerHTML)
			name = _getTagNameWithoutTrim(attStr)
			attStr = attStr.replace(/^\S+\s*/, '')
			var tag = new Tag(node, isBlock, name, _tags[name], attStr, scope, function (n, s/*node, scope*/) {
				// render childNodes recursively
				return walk(n, s)
			})
			output += tag.render()
			break
		// Text Node
		case 4:
			if(scope.$shouldRender) output += node.nodeValue
			break
	}
	return output
}
function Comps (options) {
	options = options || {}
	var ast = Parser(options.template)
	var scope = options.scope || new Scope(null, {
		shouldRender: !options.pagelet,
		pagelet: options.pagelet
	})
	var output = walk(ast, scope)
	if (options.attributes) {
		output = output.replace(
			new RegExp('^(\\s*)<([\\w\\-]+)([^\>]*?)(/?>)', 'm'), 
			function (m, space, name, attStr, end) {
				var nodeAtts = ATTParser(attStr)
				var overrideAtts = {}
				var attributes = attributeStringify(util.extend({}, nodeAtts, options.attributes), overrideAtts)
				// merge class
				if (nodeAtts.class && options.attributes.class) {
					overrideAtts['class'] = nodeAtts.class + ' ' + options.attributes.class
				}
				return space + '<' + name + (attributes ? ' ' + attributes : '') + end
			})
	}
	return output
}
Comps.tag = function (name, def) {
	_tags[name] = def
}
Comps.componentLoader = function (loader) {
	componentLoader = loader
}
Comps.componentTransform = function (transform) {
	componentTransform = transform
}
Comps.config = function (name, value) {
	_config[name] = value
	switch (name) {
		case 'openTag':
		case 'closeTag':
			// static
			_open_tag_reg_str = _genRegStr(_config.openTag)
			_close_tag_reg_str = _genRegStr(_config.closeTag)
			_block_close_reg = _genBlockCloseReg()
			_self_close_reg = _genSelfCloseReg()
			_wildcard_reg = _genWildcardReg()
			_trim_reg = _genTrimReg()
			break
	}
}
module.exports = Comps
function attributeStringify(atts) {
	return Object.keys(atts).reduce(function (result, item) {
		if (!/^\$/.test(item)) result.push( item + '="' + atts[item] + '"')
		return result
	}, []).join(' ')
}
function hasProp(o, prop) {
	return o.hasOwnProperty(prop)
}
function isUndef(o) {
	return o === void(0)
}
function noop(){}