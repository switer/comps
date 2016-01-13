'use strict'

var ATTParser = require('attribute-parser')
var EMPTY_RESULT = ['', '']
var util = require('./util')
var Scope = require('./scope')
var tagUtil = require('./tag-util')

function Tag(node, paired, name, def, raw, scope, walk) {

    if (paired && def.paired === false) 
        util.warn('Tag "' + name + '" should not a self-closing tag. ' + tagUtil.wrap(name, raw))
    
    if (!paired && def.paired === true) 
        util.warn('Tag "' + name + '" must be a self-closing tag. ' + tagUtil.wrap(name, raw))

    var scopeOpt = def.scope
    var created = def.created
    var outer = def.outer
    var inner = def.inner
    var ctx = this

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
        var walkResult = inner.call(ctx) || ''
        return result[0] + walkResult + result[1] 
    }
    created && created.call(this)
}
Tag.prototype.render = function () {
    return this.$render()
}

module.exports = Tag