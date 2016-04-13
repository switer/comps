'use strict'

var path = require('path')
var fs = require('fs')
var ASTParser = require('block-ast')
var ATTParser = require('attribute-parser')
var util = require('./lib/util')
var tagUtil = require('./lib/tag-util')
var Scope = require('./lib/scope')
var BigPipe = require('./lib/bigpipe')
var Tag = require('./lib/tag')
var config = require('./lib/config')
var execute = require('./lib/execute')
var EMPTY_RESULT = ['', '']
var EMPTY_STRING = ''
var CHUNK_SPLITER = '<!--{% chunk /%}-->'

/**
 * Create Comps constructor with isolated private variables
 */
function CompsFactory() {

	/**
	 * Private match regexps or reg-strings
	 */
	var _open_tag_reg_str = _genRegStr(config.openTag)
	var _close_tag_reg_str = _genRegStr(config.closeTag)
	var _wildcard_reg = _genWildcardReg()
	var _paired_close_reg = _genPairedCloseReg()
	var _self_close_reg = _genSelfCloseReg()
	var _trim_reg = _genTrimReg()
	/**
	 * Interal util methods
	 */
	function _genRegStr (str) {
		return '\\' + str.split('').join('\\')
	}
	function _genPairedCloseReg () {
		return new RegExp(_open_tag_reg_str + '\\s*/[\\s\\S]+?' + _close_tag_reg_str, 'm')
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
		return ATTParser(_trim(c))
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
			return !_paired_close_reg.test(tag)
		},
		{
			strict: true // unclosing tag will throw error.
		}
	)

	var componentLoader = defaultComponentLoader
	var fileLoader = defaultFileLoader
	var transforms = []
	var _compileAspects = {}

	/**
	 * Internal variables
	 * build in tags
	 */
	var _tags = {
		pagelet: {
			paired: true,
			recursive: true,
			scope: function (scope) {
				scope.$pagelet = scope.$pagelet || ''
				scope.$patches = scope.$patches 
					? scope.$patches.slice() 
					: []
			},
			created: function () {
				this.tagname = this.$attributes.$tag || 'div'
				this.nowrap = !this.$scope.$pagelet || !this.$attributes.$wrap || this.$attributes.$wrap == 'false'

				var id = this.$attributes.$id
				if (!id) {
					throw new Error(
						'Pagelet tag missing "$id" attribute.'
						+ tagUtil.errorTrace(this)
					)
				}
				// pagelet patches
				var patches = this.patches = this.$scope.$patches
				patches.push(id)
				if (this.$scope.$pagelet === patches.join('.')) {
					this.$scope.$shouldRender = true
				}
			},
			outer: function () {
				if (this.nowrap) return EMPTY_RESULT

				var attStr = util.attributeStringify(this.$attributes)
				return [
					'<' + this.tagname + ' data-pageletid="' + this.patches.join('.') + '"' + (attStr ? ' ' + attStr : '') + '>',
					'</' + this.tagname + '>'
				]
			},
			inner: function () {
				var ctx = this
				return this.$el.childNodes.map(function (n) {
					return ctx.$walk(n, ctx.$scope)
				}).join('')
			}
		},
		component: {
			recursive: true,
			scope: function (scope) {
				var $parent = scope.$data
				scope.$data = Object.create(null)
				scope.$data.$parent = $parent

			},
			created: function () {
				this.tagname = this.$attributes.$tag || 'div'

				this.replace = !this.$attributes.$replace || (this.$attributes.$replace && this.$attributes.$replace != 'false')
				this.merge = this.$attributes.$replace === 'nomerge' ? false : true // default merge
				var id = this.id = this.$attributes.$id
				if (!id) {
					throw new Error(
						'Component tag missing "$id" attribute.'
						+ tagUtil.errorTrace(this)
					)
				}

				var resolveInfo = componentLoader.call(this, this.id)
				var isObj = util.type(resolveInfo) == 'object'
				var isStr = util.type(resolveInfo) == 'string'
				this.request = isObj ? resolveInfo.request : ''
				this.content = isObj ? resolveInfo.content : (resolveInfo || '')
				if (!isObj && !isStr) {
					throw new Error(
						'Invalid result of component-loader, please check "componentLoader".'
						+ tagUtil.errorTrace(this)
					)
				}
				/**
				 * call transfrom After load component
				 * @param  {[type]} transforms.length [description]
				 * @return {[type]}                   [description]
				 */
				if (transforms.length) {
					var that = this
					transforms.forEach(function (fn) {
						fn && fn.call(that, id)
					})
				}
				var dataStr = this.$attributes.$data
				if (dataStr) {
					try {
						var data = execute('{' + dataStr + '}', this.$scope.$data.$parent)
						this.$scope.$data = data
					} catch(e) {
						throw new Error(
							'"' + dataStr + '" => "' + e.message + '"'
							+ tagUtil.errorTrace(this)
						)
					}
				}
			},
			outer: function () {
				if (this.replace) return EMPTY_RESULT

				var attStr = util.attributeStringify(this.$attributes)
				return [
					'<' + this.tagname + (attStr ? ' ' + attStr : '') + '>',
					'</' + this.tagname + '>'
				]
			},
			inner: function () {
				var reg = /^\$/
				var attrs = util.attributesExclude(this.$attributes, reg)

				return Comps({
					context: path.dirname(this.request),
					template: this.content || '',
					children: this.$el.childNodes,
					scope: this.$scope.$clone(),
					attributes: this.replace && this.merge && Object.keys(attrs) ? attrs : null
				})
			}
		},
		include: {
			recursive: true,
			scope: true,
			created: function () {
				this.context = this.$scope.$context
					? this.$scope.$context
					: process.cwd()

				var request = this.request = this.$attributes.$path
				if (!request) {
					throw new Error(
						'Invalid "$path" of include tag.'
						+ tagUtil.errorTrace(this)
					)
				}
			},
			outer: function () {
				return EMPTY_RESULT
			},
			inner: function () {
				var resolveInfo = fileLoader.call(this, this.request, this.context)
				if (!resolveInfo) {
					throw new Error(
						'Invalid result of file-loader, please check the "fileLoader" is specified or not.'
						+ tagUtil.errorTrace(this)
					)
				}
				return Comps({
					context: path.dirname(resolveInfo.request),
					template: resolveInfo.content || '',
					scope: this.$scope
				})
			}
		},
		chunk: {
			paired: false,
			recursive: false,
			created: function () {
				var rootScope = this.$scope.$root()
				var id = this.$attributes.$id
				var requires = this.$attributes.$require.trim()

				if (this.$scope.$chunk && rootScope.$chunks) {
					rootScope.$chunks.push({
						id: id || '',
						requires: requires ? requires.split(/\s*,\s*/m) : []
					})
				}
			},
			outer: function () {
				return this.$scope.$chunk
					? [CHUNK_SPLITER, '']
					: EMPTY_RESULT
			},
			inner: function () {
				return EMPTY_STRING
			}
		},
		'>': {
			paired: false,
			recursive: false,
			created: function () {
				this.output = ''
				if (this.$raw) {
					var result
					try {
						result = execute(this.$raw, this.$scope.$data)
					} catch (e) {
						result = ''
						console.log(
							'"' + this.$raw + '" => ' + '"' + e.message + '"'
							+ tagUtil.errorTrace(this)
						)
					}
					var t = util.type(result)
					var output = ''
					switch (t) {
						case 'function':
							output = result.toString()
							break
						case 'object':
						case 'array':
							try {
								output = JSON.stringify(t)
								break
							} catch(e) {
								
							}
						default:
							output = result
					}
					this.output = output
				}
			},
			outer: function () {
				return [this.output, EMPTY_STRING]
			},
			inner: function () {
				return EMPTY_STRING
			}
		}
	}

	/**
	 * Comps module interfaces
	 */
	function Comps (options) {
		return Comps.compile(options.template)(options)
	}
	Comps.tag = function (name, def) {
		_tags[name] = def
		return Comps
	}
	Comps.aspect = function (name, def) {
		_compileAspects[name] = def
		return Comps
	}
	Comps.componentLoader = function (loader) {
		componentLoader = loader
		return Comps
	}
	Comps.fileLoader = function (loader) {
		fileLoader = loader
		return Comps
	}
	Comps.componentTransform = function (fn) {
		transforms.push(fn)
		return Comps
	}
	Comps.config = function (name, value) {
		config[name] = value
		switch (name) {
			case 'openTag':
			case 'closeTag':
				// generate regexp object when config changed
				_open_tag_reg_str = _genRegStr(config.openTag)
				_close_tag_reg_str = _genRegStr(config.closeTag)
				_paired_close_reg = _genPairedCloseReg()
				_self_close_reg = _genSelfCloseReg()
				_wildcard_reg = _genWildcardReg()
				_trim_reg = _genTrimReg()
				break
		}
		return Comps
	}
	Comps.compile = function (tpl) {
		if (!tpl && tpl !== '') throw new Error('Unvalid template.')
		var ast = Parser(tpl)

		return function (options) {
			options = options || {}
			var pagelet = options.pagelet
			var shouldRender = !pagelet
			var attributes = options.attributes
			var scope = options.scope || new Scope({
				'$shouldRender': shouldRender,
				'$pagelet': pagelet,
				'$data': Object.create(null)
			})
			/**
			 * write "$shouldRender" property to external passing scope
			 */
			if (!util.hasProp(scope, '$shouldRender')) {
				scope.$shouldRender = shouldRender
			}
			/**
			 * write "$pagelet" property to external passing scope
			 */
			if (!util.hasProp(scope, '$pagelet') && pagelet) {
				scope.$pagelet = pagelet
			}
			/**
			 * Write "$context" property to scope if context option given
			 */
			if (options.context) {
				scope.$context = options.context
			}
			/**
			 * Write "$context" property to scope if context option given
			 */
			if (options.chunk) {
				scope.$chunk = !!options.chunk
			}
			scope.$data = util.extend(scope.$data || {}, options.data)
			return tagUtil.merge(walk(ast, scope), attributes)
		}
	}
	Comps.bcompile = function (options) {
		var scope = new Scope({
			$chunks: []
		})
		var temp = Comps(util.extend({}, options, {
			chunk: true,	// will convert chunk tag to chunk_spliter otherwise empty 
			scope: scope
		}))
		var cparts = temp.split(CHUNK_SPLITER)
		var chunks = scope.$chunks
		var total = chunks.length

		if (total) {
			chunks.forEach(function (item, i) {
				var content = cparts[i]
				if (i == total - 1) content += cparts[total]
				item.content = content
			})
		} else {
			chunks = [{
				id: '',
				requires: [],
				content: cparts[0]
			}]
		}
		// todo if chunks is empty
		return function() {
			return new BigPipe(chunks.slice())
		}
	}
	Comps.bigpipe = function (options) {
		var creator = Comps.bcompile(options)
		return creator()
	}
	Comps.Scope = Scope
	Comps.defaultComponentLoader = defaultComponentLoader
	Comps.defaultFileLoader = defaultFileLoader
	Comps.create = CompsFactory
	function walk(node, scope) {
		var name
		var isPaired = false
		var output = ''
		switch(node.nodeType) {
			// Root
			case 1:
				output += node.childNodes.map(function (n) {
					return walk(n, scope)
				}).join('')
				break
			// Paired Tag
			case 2:
				isPaired = true
			// Self-Closing Tag
			case 3:
				var attStr = _trim(isPaired ? node.openHTML : node.outerHTML)
				name = _getTagNameWithoutTrim(attStr)
				attStr = attStr.replace(/^\S+\s*/, '')
				var def = _tags[name]

				if (def){
					var tag = new Tag(node, isPaired, name, def, attStr, scope, _compileAspects, function (n, s/*node, scope*/) {
						// render childNodes recursively
						return walk(n, s)
					})
					output += tag.render()
				} else {
					util.warn('"' + name + '" is not defined. ' + tagUtil.wrap(name, attStr))
				}
				break
			// Text Node
			case 4:
				if(scope.$shouldRender) output += node.nodeValue
				break
		}
		return output
	}
	return Comps
}
function noop(){}

function defaultComponentLoader (name) {
	var request = path.join(process.cwd(), 'c', name, name, '.tpl')
    return {
        request: request,
        content: fs.readFileSync(request, 'utf-8')
    }
}
function defaultFileLoader (request, context) {
    var fpath = path.isAbsolute(request) 
        ? request
        : path.join(context, request)

    return {
        request: fpath,
        content: fs.readFileSync(fpath, 'utf-8')
    }
}

module.exports = CompsFactory()