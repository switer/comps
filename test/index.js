'use strict';

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var comps = require('../index')

comps.componentLoader(function (name) {
    var fpath = __dirname + '/c/' + name + '/' + name + '.tpl'
    return {
        request: fpath,
        content: fs.readFileSync(fpath, 'utf-8').replace(/\r?\n\s+/g, '')
    }
})
comps.fileLoader(function (request, context) {
    var fpath = path.isAbsolute(request) 
        ? request
        : path.join(context, request)

    return {
        request: fpath,
        content: fs.readFileSync(fpath, 'utf-8').replace(/\r?\n\s+/g, '')
    }
})
comps.componentTransform(function (name) {
    this.$attributes['r-component'] = 'c-' + name
})
describe('Class-Methods: Comps()', function () {
    it('Render component tag', function () {
        var r = comps({
            template: '<div>{% component $id="header" /%}</div>'
        })
        assert.equal(r, '<div><div r-component="c-header"><div class="header"></div></div></div>')
    })
})
describe('Class-Methods: config()', function () {
    it('Custom tag', function () {
        comps.config('openTag', '<%')
        comps.config('closeTag', '%>')
        var r = comps({
            template: '<div><% component $id="header" /%></div>'
        })
        assert.equal(r, '<div><div r-component="c-header"><div class="header"></div></div></div>')
        comps.config('openTag', '{%')
        comps.config('closeTag', '%}')
    })
})
require('./spec-tags.js')
require('./spec-bigpipe.js')

