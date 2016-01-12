'use strict'

var assert = require('assert')
var comps = require('../index')

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
            template: '<div>{% pagelet $id="header" %}{% pagelet $id="content" %}<div class="header-content"></div>{%/pagelet%}{% pagelet $id="content" %}<div class="header-content2"></div>{%/pagelet%}{%/pagelet%}</div>'
        })
        assert.equal(r, '<div data-pageletid="header.content"><div class="header-content"></div></div><div data-pageletid="header.content"><div class="header-content2"></div></div>')
    })
    it('Render nested pagelet with another pagelets', function () {
        var r = comps({
            pagelet: 'header.content',
            template: '{% pagelet $id="content" %}<div class="another-content"></div>{%/pagelet%}<div>{% pagelet $id="header" %}{% pagelet $id="content" %}<div class="header-content"></div>{%/pagelet%}{% pagelet $id="content2" %}<div class="header-content2"></div>{%/pagelet%}{%/pagelet%}</div>'
        })
        assert.equal(r, '<div data-pageletid="header.content"><div class="header-content"></div></div>')
    })
    it('Render pagelet inside component', function () {
        var r = comps({
            pagelet: 'footerlink',
            template: '{% component $id="footer"/%}'
        })
        assert.equal(r, '<div data-pageletid="footerlink" r-component="c-footer"><a href="" class="link"></a></div>')
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
    it('No merged attributes', function () {
        var r = comps({
            template: '<div>{% component $id="header" $replace="nomerge" data-index="{index: 0}" class="header2" data-name="header" /%}</div>'
        })
        assert.equal(r, '<div><div class="header"></div></div>')
    })
})
describe('Tags: include', function () {
    it('Request relative path', function () {
        var r = comps({
            context: __dirname,
            template: '<div class="container">{% include $path="tpls/include-case-1.tpl" /%}</div>'
        })
        assert.equal(r, '<div class="container"><div>case 1</div></div>')
    })
    it('Included file contains component tag', function () {
        var r = comps({
            context: __dirname,
            template: '<div class="container">{% include $path="tpls/include-case-2.tpl" /%}</div>'
        })
        assert.equal(r, '<div class="container"><div class="case 2"><div class="header" r-component="c-header"></div></div></div>')
    })
    it('Using in component tag', function () {
        var r = comps({
            context: __dirname,
            template: '<div class="container">{% include $path="tpls/include-case-3.tpl" /%}</div>'
        })
        assert.equal(r, '<div class="container"><div class="case 3"><div class="content" r-component="c-content"><button class="content-button">name</button></div></div></div>')
    })
    it('Using with pagelet', function () {
        var r = comps({
            context: __dirname,
            pagelet: 'content',
            template: '<div class="container">{% include $path="tpls/include-case-4.tpl" /%}</div>'
        })
        assert.equal(r.trim(), '<div class="case 4"><div class="content" r-component="c-content"><button class="content-button">name</button></div></div>')
    })
    it('Using with component', function () {
        var r = comps({
            context: __dirname,
            template: '{% include $path="tpls/include-case-5.tpl" /%}'
        })
        assert.equal(r.trim(), '<div class="case 5"><div class="main" r-component="c-main"><div class="header" r-component="c-header"></div><section class="part"></section>\n</div></div>')
    })
})