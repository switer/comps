'use strict';

var BlockNested = require('block-nested')

/**
 * Internal variables
 */
var _blockComponents = {}
var _selfCloseComponents = {}
/**
 * Comps's config
 */
var _config = {
	openTag: '{%',
	closeTag: '%}'
}
/**
 * Private match regexps
 */
var _trim_reg = _genTrimReg()
var _wildcard_reg = _genWildcardReg()
var _block_close_reg = _genBlockCloseReg()
var _self_close_reg = _genSelfCloseReg()
/**
 * Interal util methods
 */
function _genRegStr (str) {
	return '\\' + str.split('').join('\\')
}
function _genBlockCloseReg () {
	return new RegExp(_genRegStr(_config.openTag) + '\/[\\s\\S]+?' + _genRegStr(_config.closeTag()))
}
function _genSelfCloseReg () {
	return new RegExp(_genRegStr(_config.openTag) + '\/[\\s\\S]+?/' + _genRegStr(_config.closeTag()))
}
function _genWildcardReg () {
	return new RegExp(_genRegStr(_config.openTag) + '[\\s\\S]+?' + _genRegStr(_config.closeTag), 'gm')
}
function _genTrimReg () {
	return new RegExp('^' + _genRegStr(_config.openTag) + '\\s|\\s' + _genRegStr(_config.closeTag) + '$', 'gm')
}
function _getNameFromAttribute(c) {
	return c.replace(_trim_reg, '').split(' ')[0]
}
function _getAttributes(c) {
	var attStr = c.replace(_trim_reg, '')
	
}
/**
 * Singleton parser instance
 */
var _Parser = BlockNested(
	function operator() {
		return _wildcard_reg
	},
	function isSelfClose (c) {
		var cname = _getNameFromAttribute(c)
		return !!_selfCloseComponents[cname] || _self_close_reg.test(c)
	},
	function isOpen (c) {
		return !_block_close_reg.test(c)
	},
	function handler(c) {
		switch (ast.type) {
			case 'close':
				break
			case 'block':
				break
		}
	}
)
/**
 * Comps module interfaces
 */
function Comps (text) {
}
Comps.component = function (name, def) {

}
Comps.compile = function () {

}
Comps.config = function (name, value) {
	_config[name] = value
	switch (name) {
		case 'openTag':
		case 'closeTag':
			_block_close_reg = _genBlockCloseReg()
			_self_close_reg = _genSelfCloseReg()
			_wildcard_reg = _genWildcardReg()
			_trim_reg = _genTrimReg()
			break
	}
}
module.exports = Comps