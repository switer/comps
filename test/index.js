'use strict';

var fs = require('fs')
var comps = require('../index')
var assert = require("assert")

comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl', 'utf-8')
})
comps.componentTransform(function (name) {
    this.$attributes['r-component'] = 'c-' + name
})
describe('#Options', function () {

})
describe('#Component', function () {
    it('Render component tag', function () {
        var r = comps({
            template: '<div>{% component $id="header" /%}</div>'
        })
        assert.equal(r, '<div><div r-component="c-header"><div class="header"></div></div></div>')
    })
    it('$replace option', function () {
        var r = comps({
            template: '<div>{% component $id="header" $replace="true" data-index="{index: 0}" /%}</div>'
        })
        assert.equal(r, '<div><div class="header" data-index="{index: 0}" r-component="c-header"></div></div>')
    })
})
describe('#Pagelet', function () {

})