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
})
