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
    it('render component tag', function () {
        var r = comps({
            template: '<div>{% component $id="header" /%}</div>'
        })
        assert.equal('<div><div r-component="c-header"><div class="header"></div></div></div>', r)
    })
})
describe('#Pagelet', function () {

})