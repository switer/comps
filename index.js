'use strict';

var BlockNested = require('block-nested')
// var SELF_CLOSE_REG = /\{%[\s\S]+?\/%\}/
// var CLOSE_REG = /\{%\/[\s\S]+?%\}/

// var parser = require('../index')(
// 	/\{%[\s\S]+?%\}/g,
// 	// first match self-close tag
// 	// this judge condition is base on the condition of operator match
// 	function isSelfCloseTag (c) {
// 		return SELF_CLOSE_REG.test(c)
// 	},
// 	// secondary match block-open tag
// 	// this judge condition is base on the condition of operator match
// 	function isOpenTag (c) {
// 		return !CLOSE_REG.test(c)
// 	},
// 	function handler(ast) {
// 		switch (ast.type) {
// 			case 'close':
// 				return '<component />'
// 			case 'block':
// 				return '<component-block>'+ ast.content + '</component-block>'
// 		}
// 	}
// )

function regStr (str) {
	return '\\' + str.split('').join('\\')
}
/\{%[\s\S]+?%\}/gm
var _block_close_reg = new RegExp(regStr(_config.openTag) + '\/[\\s\\S]+?' + regStr(_config.closeTag()))
var _operator_reg = new RegExp(regStr(_config.openTag))
var _components = {}
var _config = {
	openTag: '{%',
	closeTag: '%}'
}

var _Parser = BlockNested(
	function operator() {
		return _operator_reg
	},
	function isSelfClose (c) {
		return 
	},
	function isOpen (c) {
		return
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

function Comps () {
}
Comps.compile = function () {

}
Comps.render = function () {
	
}
Comps.config = function (name, value) {
	switch (name) {
		case 'openTag':
		case 'closeTag':
	}

	_config[name] = value
}
module.exports = Comps