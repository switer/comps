'use strict';

var path = require('path')
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
	},
	{
		strict: true // unclosing tag will throw error.
	}
)
var componentLoader = noop
var fileLoader = noop
var componentTransform = noop
var EMPTY_RESULT = ['', '']
/**
 * Internal variables
 */
var _tags = {
	// build in tags
	pagelet: {
		block: true,
		scope: function (scope) {
			scope.$pagelet = scope.$pagelet || ''
			scope.$patches = scope.$patches 
				? scope.$patches.slice() 
				: []
		},
		created: function () {
			this.tagname = this.$attributes.$tag || 'div'
			this.nowrap = this.$attributes.$wrap && this.$attributes.$wrap != 'false'

			var id = this.$attributes.$id
			if (!id) throw new Error(wrapTag(this.$name, this.$raw) + ' missing "$id" attribute.')
			// pagelet patches
			var patches = this.patches = this.$scope.$patches
			patches.push(id)
			if (this.$scope.$root().$pagelet === patches.join('.')) {
				this.$scope.$shouldRender = true
			}
		},
		render: function () {
			if (this.nowrap) return EMPTY_RESULT

			var attStr = util.attributeStringify(this.$attributes)
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
			this.merge = this.$attributes.$replace === 'nomerge' ? false : true // default merge
			var id = this.id = this.$attributes.$id
			if (!id) throw new Error(wrapTag(this.$name, this.$raw) + ' missing "$id" attribute.')

			componentTransform.call(this, id)
		},
		render: function () {
			if (this.replace) return EMPTY_RESULT

			var attStr = util.attributeStringify(this.$attributes)
			return [
				'<' + this.tagname + (attStr ? ' ' + attStr : '') + '>',
				'</' + this.tagname + '>'
			]
		},
		walk: function () {
			var reg = /^\$/
			var attrs = util.attributesExclude(this.$attributes, reg)
			var resolveInfo = componentLoader.call(this, this.id)
			var request = util.type(resolveInfo) == 'object' 
				? resolveInfo.request
				: ''
			var content = util.type(resolveInfo) == 'object'
				? resolveInfo.content
				: resolveInfo

			return Comps({
				context: path.dirname(request),
				template: content || '',
				children: this.$el.childNodes,
				scope: this.$scope,
				attributes: this.replace && this.merge && Object.keys(attrs) ? attrs : null
			})
		}
	},
	include: {
		created: function () {
			this.context = this.$scope.$context
				? this.$scope.$context
				: process.cwd()

			var request = this.request = this.$attributes.$request
			if (!request) {
				throw new Error('Can\'t request "', request, '" under "', this.$scope.$context, '"')
			}
		},
		render: function () {
			return EMPTY_RESULT
		},
		walk: function () {
			var resolveInfo = fileLoader.call(this, this.request, this.context)
			return Comps({
				context: path.dirname(resolveInfo.request),
				template: resolveInfo.content || '',
				scope: this.$scope
			})
		}
	}
}
function Scope(parent, data) {
	util.extend(this, parent, data)
	this.$parent = parent || null
}
Scope.prototype.$root = function () {
	var root = this
	while(root.$parent) {
		root = root.$parent
	}
	return root
}
Scope.prototype.$rootScope = function () {
	return this.$scope.$root()
}
function Tag(node, isBlock, name, def, raw, scope, walk) {

	if (isBlock && def.block === false) 
		warn('Tag "' + name + '" should not a self-closing tag. ' + wrapTag(name, raw))
	
	if (!isBlock && def.block === true) 
		warn('Tag "' + name + '" must be a self-closing tag. ' + wrapTag(name, raw))

	var scopeOpt = def.scope
	var created = def.created
	var render = def.render
	var _walk = def.walk
	var ctx = this

	this.$el = node
	this.$raw = raw
	this.$name = name
	this.$attributes = _getAttributesWithoutTrim(raw)

	if (scopeOpt) {
		// create child scope instance
		this.$scope = new Scope(scope)
		if (util.type(scopeOpt) == 'function') {
			// tag's facade method of scope 
			scopeOpt.call(this, this.$scope)
		}
	} else {
		// inherit parent's scope
		this.$scope = scope
	}

	var $scope = this.$scope
	this.$walk = walk
	this.$render = function () {
		var willRender = $scope.$shouldRender
		var result = willRender ? render.call(ctx) : EMPTY_RESULT
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
function Comps (options) {
	return Comps.compile(options.template)(options)
}
Comps.tag = function (name, def) {
	_tags[name] = def
}
Comps.componentLoader = function (loader) {
	componentLoader = loader
}
Comps.fileLoader = function (loader) {
	fileLoader = loader
}
Comps.componentTransform = function (transform) {
	componentTransform = transform
}
Comps.compile = function (tpl) {
	if (!tpl && tpl !== '') throw new Error('Unvalid template.')
	var ast = Parser(tpl)

	return function (options) {
		options = options || {}
		var pagelet = options.pagelet
		var attributes = options.attributes
		var scope = options.scope || new Scope(null, {
			'$shouldRender': !pagelet,
			'$pagelet': pagelet
		})
		if (options.context) scope.$context = options.context
		return mergeTag(walk(ast, scope), attributes)
	}
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
			var def = _tags[name]

			if (def){
				var tag = new Tag(node, isBlock, name, def, attStr, scope, function (n, s/*node, scope*/) {
					// render childNodes recursively
					return walk(n, s)
				})
				output += tag.render()
			} else {
				warn('"' + name + '" is not defined. ' + wrapTag(name, attStr))
			}
			break
		// Text Node
		case 4:
			if(scope.$shouldRender) output += node.nodeValue
			break
	}
	return output
}
function mergeTag (html, attrs) {
	return !attrs ? html : html.replace(
		new RegExp('^(\\s*)<([\\w\\-]+)([^\>]*?)(/?>)', 'm'), // get element open tag html
		function (m, space, name, attStr, end) {
			var nodeAttrs = ATTParser(attStr)
			var attributes = util.extend({}, nodeAttrs, attrs) // passing attributes first
			// merge class
			if (nodeAttrs.class && attrs.class) {
				attributes['class'] = nodeAttrs.class + ' ' + attrs.class
			}
			attributes = util.attributeStringify(attributes)
			return space + '<' + name + (attributes ? ' ' + attributes : '') + end
		}
	)
}
function wrapTag (name, raw) {
	return '"' + _config.openTag + ' ' + name + ' ' + raw + ' ' + _config.closeTag + '"'
}
function noop(){}
module.exports = Comps