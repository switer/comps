'use strict'

var ATTParser = require('attribute-parser')
var EMPTY_RESULT = ['', '']
var util = require('./util')
var Scope = require('./scope')
var tagUtil = require('./tag-util')

function returnValue(v) {
    return v
}
function through(aspect, fn) {
    return function () {
        aspect && aspect.apply(this, arguments)
        if (fn) return fn.apply(this, arguments)
    }
}
function Tag(node, paired, name, def, raw, scope, aspects, walk) {

    if (paired && def.paired === false) 
        util.warn('Tag "' + name + '" should not a self-closing tag. ' + tagUtil.wrap(name, raw))
    
    if (!paired && def.paired === true) 
        util.warn('Tag "' + name + '" must be a self-closing tag. ' + tagUtil.wrap(name, raw))

    var scopeOpt = def.scope
    var created = def.created
    var outer = def.outer
    var inner = def.inner
    var recursive = def.recursive
    var ctx = this
    var aspect = aspects[name] || {}

    var innerAspect = aspect.inner || returnValue
    var outerAspect = aspect.outer || returnValue
    var renderAspect = aspect.render || returnValue

    /**
     * Insert aspect
     */
    created = through(aspect.beforeCreated, created)
    inner = through(aspect.beforeInner, inner)
    outer = through(aspect.beforeOuter, outer)

    this.$el = node
    this.$raw = raw
    this.$name = name
    this.$attributes = ATTParser(raw)

    if (scopeOpt) {
        // create child scope instance
        this.$scope = new Scope(null, scope)
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
        var result = willRender 
            ? outer.call(ctx) 
            : EMPTY_RESULT

        var walkResult = willRender || (!willRender && recursive) 
            ? inner.call(ctx) || ''
            : ''

        result = outerAspect.call(ctx, result)
        return renderAspect.call(ctx, result[0] + innerAspect.call(ctx, walkResult) + result[1])
    }
    created && created.call(this)
}
Tag.prototype.render = function () {
    return this.$render()
}

module.exports = Tag