'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Output', function () {
    it('Using component data', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-1" $data="name: \'comps output\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-1">comps output</div></div>')
    })
    it('data through to pagelet', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-2" $data="name: \'comps output\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-2">comps output\n</div></div>')
    })
    it('Using $parent data', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-3-1" $data="name: \'comps output\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-3-1"><div r-component="c-output-case-3-2">comps output</div></div></div>')
    })
    it('Expression', function () {
        var str = comps({
            template: '<div>{% component $id="output-case-4" $data="title: \'hello\', content: \'word\'" %}{%/component%}</div>',
        })
        assert.equal(str, '<div><div r-component="c-output-case-4">title:hello => content:word\n</div></div>')
    })
    it('$exist', function () {
        var str = comps({
            template: '{% component $id="output-case-5" /%}',
        })
        assert.equal(str, '<div r-component="c-output-case-5">option not exist</div>')
    })
    it('$get', function () {
        var str = comps({
            template: '{% component $id="output-case-6" $data="key2: 123"/%}',
        })
        assert.equal(str, '<div r-component="c-output-case-6">key1 not exist/123</div>')
    })
    it('$get', function () {
        var str = comps({
            template: '{% component $id="output-case-7" $data="key2: 123"/%}',
        })
        assert.equal(str, '<div r-component="c-output-case-7">:123</div>')
    })
    it('?', function () {
        var str = comps({
            template: '{% component $id="output-case-8" $data="isShowHeader: true"/%}',
        })
        var st2 = comps({
            template: '{% component $id="output-case-8" $data="isShowHeader: false"/%}',
        })
        assert.equal(str, '<div r-component="c-output-case-8"><div class="header" r-component="c-header"></div></div>')
        assert.equal(st2, '<div r-component="c-output-case-8"></div>')
    })
})
