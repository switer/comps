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
    it('Custom delimiter', function () {
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
describe('Class-Methods: tag()', function () {
    it('Custom tag', function () {
        comps.tag('=', {
            paired: false,
            outer: function () {
                return ['<span r-text>', '</span>']
            },
            inner: function () {
                return '{' + this.$raw + '}'
            }
        })
        var r = comps({
            template: '{%= title /%}'
        })
        assert.equal(r, '<span r-text>{title}</span>')
    })
    it('Custom tag with pagelet', function () {
        comps.tag('=', {
            paired: false,
            outer: function () {
                return ['<span r-text>', '</span>']
            },
            inner: function () {
                return '{' + this.$raw + '}'
            }
        })
        var r = comps({
            template: '{%= title /%}{%pagelet $id="pagelet"%}pagelet-content{%/pagelet%}',
            pagelet: 'pagelet'
        })
        assert.equal(r, 'pagelet-content')
    })
})