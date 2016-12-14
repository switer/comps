'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Component', function () {
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
    it('Events: emit created event', function (done) {
        var unwatch = comps.on('componentcreated', function (c) {
            assert.equal(c.$attributes.$id, 'header')
            assert.equal(c.$attributes.$replace, 'nomerge')
            assert.equal(c.$attributes.class, 'header2')
            done()
        })
        var r = comps({
            template: '<div>{% component $id="header" $replace="nomerge" data-index="{index: 0}" class="header2" data-name="header" /%}</div>'
        })
        unwatch()
    })
    it('Events: emit beforeload event', function (done) {
        var unwatch = comps.on('beforecomponentload', function (id, c) {
            assert.equal(id, 'header')
            assert.equal(c.$attributes.$id, 'header')
            done()
        })
        var r = comps({
            template: '<div>{% component $id="header" $replace="nomerge" data-index="{index: 0}" class="header2" data-name="header" /%}</div>'
        })
        unwatch()
    })
    it('Events: emit loaded event', function (done) {
        var unwatch = comps.on('componentloaded', function (id, c, result) {
            assert.equal(id, 'header')
            assert.equal(c.$attributes.$id, 'header')
            assert(/header\/header\.tpl$/.test(result.request))
            assert(/header\/header\.tpl$/.test(c.request))
            assert.equal(result.content, '<div class="header"></div>')
            assert.equal(c.content, '<div class="header"></div>')
            done()
        })
        var r = comps({
            template: '<div>{% component $id="header" $replace="nomerge" data-index="{index: 0}" class="header2" data-name="header" /%}</div>'
        })
        unwatch()
    })
    it('$insertion point: $content', function () {
        var r = comps({
            template: '{% component $id="insertion-point"%}Inert to component{%/component%}'
        })
        assert.equal(r, '<div r-component="c-insertion-point">Inert to component</div>')
    })
    it('$insertion point in outer rendering', function () {
        var r = comps({
            template: '{% component $id="insertion-point"%}{%component $id="header"/%}{%/component%}'
        })
        assert.equal(r, '<div r-component="c-insertion-point"><div class="header" r-component="c-header"></div></div>')
    })
    it('Default Loader: component', function () {
        var r = comps({
            template: '{% component $id="comps/list" /%}{% component $id="comps/item" /%}'
        })
        assert.equal(r, '<ul class="list" r-component="c-list"></ul><div class="item" r-component="c-item"></div>')
    })
})
