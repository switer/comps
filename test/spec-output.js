'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Output', function () {
    it('Output component data', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-1" $data="name: \'comps output\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-1">comps output</div></div>')
    })
    it('Output data through to pagelet', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-2" $data="name: \'comps output\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-2">comps output\n</div></div>')
    })
    it('Output $parent data', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-3-1" $data="name: \'comps output\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-3-1"><div r-component="c-output-case-3-2">comps output</div></div></div>')
    })
})