'use strict';

var Tracer = require('debug-trace')
Tracer({always: true})

// var BlockNested = require('block-nested')
var ASTParser = require('block-ast')
var ATTParser = require('attribute-parser')
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
	return new RegExp(_open_tag_reg_str + '\/[\\s\\S]+?' + _close_tag_reg_str, 'm')
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
function _getTagName(c) {
	return c.replace(_trim_reg, '').match(/\S+/)[0]
}
function _getAttributes(c) {
	var attStr = c.replace(_trim_reg, '')
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
		block: true,
		render: function () {

		}
	},
	component: {
		render: function () {

		}
	}
}
/**
 * Comps module interfaces
 */
function Comps (text) {}
Comps.component = function (name, def) {
	_tags[name] = def
}
Comps.componentLoader = function (loader) {
	componentLoader = loader
}
Comps.compile = function (text, options) {
	options = options || {}

	var ast = Parser(text)
	var pagelet = !!options.pagelet
	var output = ''

	function walk(node, scope) {
		var name
		switch(node.nodeType) {
			// Root
			case 1:
				node.childNodes.map(function (n) {
					return walk(n)
				})
				break
			// Block Tag
			case 2:
				name = _getTagName(node.openHTML)
				console.log(name)
				break
			// Self-Closing Tag
			case 3:
				name = _getTagName(node.outerHTML)
				console.log(name)
				break
			// Text Node
			case 4:
				break
		}
	}
	walk(ast)
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