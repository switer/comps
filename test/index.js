'use strict';

var fs = require('fs')
var comps = require('../index')
var assert = require("assert")

comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl', 'utf-8').replace(/\r?\n\s+/g, '')
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
describe('Tags: pagelet', function () {
    it('Render pagelet by id', function () {
        var r = comps({
            pagelet: 'header',
            template: '<div>{% pagelet $id="header" %}<div class="header"></div>{%/pagelet%}</div>'
        })
        assert.equal(r, '<div data-pageletid="header"><div class="header"></div></div>')
    })
    it('Render nested pagelet', function () {
        var r = comps({
            pagelet: 'header.content',
            template: '<div>{% pagelet $id="header" %}{% pagelet $id="content" %}<div class="header-content"></div>{%/pagelet%}{%/pagelet%}</div>'
        })
        assert.equal(r, '<div data-pageletid="header.content"><div class="header-content"></div></div>')
    })
    it('Render pagelet inside component', function () {
        var r = comps({
            pagelet: 'footerlink',
            template: '{% component $id="footer"/%}'
        })
        assert.equal(r, '<div data-pageletid="footerlink"><a href="" class="link"></a></div>')
    })
})
describe('Tags: component', function () {
    it('$replace option', function () {
        var r = comps({
            template: '<div>{% component $id="header" $replace="true" data-index="{index: 0}" /%}</div>'
        })
        assert.equal(r, '<div><div class="header" data-index="{index: 0}" r-component="c-header"></div></div>')
    })
    it('Merge attributes', function () {
        var r = comps({
            template: '<div>{% component $id="header" $replace="true" data-index="{index: 0}" class="header2" data-name="header" /%}</div>'
        })
        assert.equal(r, '<div><div class="header header2" data-index="{index: 0}" data-name="header" r-component="c-header"></div></div>')
    })
})
describe('Tags: bigpipe', function () {
    it('$replace option', function () {
        var r = comps({
            bigpipe: true,
            template: '<div>{% bigpipe $id="header" $require="a,b,c" /%}</div>'
        })
        assert.equal(r, '<div><!--{%bigpipe $id="header" $require="a,b,c"%}--></div>')
    })
})


