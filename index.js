'use strict';

// var Tracer = require('debug-trace')
// Tracer({always: true})

var ASTParser = require('block-ast')
var ATTParser = require('attribute-parser')
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
		},
		render: function () {
			var atts = Object.keys(this.$attributes)
			var ctx = this
			return [
				'<' + [this.tagname, 'data-pageletid="' + this.patches.join('.') + '"'].concat(atts.reduce(function (result, item) {
					if (!/^\$/.test(item)) result.push( item + '="' + ctx.$attributes[item] + '"')
					return result
				}, [])).join(' ') + '>',
				'</' + this.tagname + '>'
			]
		}
	},
	component: {
		created: function () {
			this.tagname = this.$attributes.$tag || 'div'
		},
		render: function () {
			var atts = Object.keys(this.$attributes)
			var ctx = this
			return [
				'<' + [this.tagname].concat(atts.reduce(function (result, item) {
					if (!/^\$/.test(item)) result.push( item + '="' + ctx.$attributes[item] + '"')
					return result
				}, [])).join(' ') + '>',
				Comps({
					template: componentLoader.call(this, this.$attributes.$id) || '',
					children: this.$el.childNodes,
					scope: this.$scope
				}),
				'</' + this.tagname + '>'
			].join('')
		}
	}
}
function Scope(parent) {
	this.$parent = parent || null
	// inherit properties
	this.$patches = parent && parent.$patches ? parent.$patches.slice() : []
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
	var ctx = this

	this.$el = node
	this.$raw = raw
	this.$name = name
	this.$attributes = _getAttributesWithoutTrim(raw)
	if (isScope) {
		// create scope
		this.$scope = new Scope(scope)
	} else {
		this.$scope = scope
	}
	this.$render = function () {
		var result = render.call(ctx)
		if (result instanceof Array) {
			return result[0] + node.childNodes.map(function (n) {
				return walk(n, ctx.$scope)
			}).join('') + result[1] 
		} else {
			return result
		}
	}
	created && created.call(this)
}
Tag.prototype.render = function () {
	return this.$render()
}
/**
 * Comps module interfaces
 */
function Comps (options) {
	options = options || {}

	var vm = this
	var ast = Parser(options.template)
	var pagelet = !!options.pagelet
	var scope = options.scope || new Scope()
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
				var tag = new Tag(node, isBlock, name, _tags[name], attStr, scope, function (n, scope) {
					return walk(n, scope)
				})
				output += tag.render()
				break
			// Text Node
			case 4:
				output += node.nodeValue
				break
		}
		return output
	}
	return walk(ast, scope)
}
Comps.tag = function (name, def) {
	_tags[name] = def
}
Comps.componentLoader = function (loader) {
	componentLoader = loader
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

function noop(){}