'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Class-Methods: Comps()', function () {
    it('Render component tag', function () {
        var r = comps({
            template: '<div>{% component $id="header" /%}</div>'
        })
        assert.equal(r, '<div><div class="header" r-component="c-header"></div></div>')
    })
})
describe('Class-Methods: config()', function () {
    it('Custom tag', function () {
        comps.config('openTag', '<%')
        comps.config('closeTag', '%>')
        var r = comps({
            template: '<div><% component $id="header" /%></div>'
        })
        comps.config('openTag', '{%')
        comps.config('closeTag', '%}')
        assert.equal(r, '<div><div class="header" r-component="c-header"></div></div>')
    })
})