'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Pagelet', function () {
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
        var str2 = comps({
            template: '{% component $id="output-case-8" $data="isShowHeader: false"/%}',
        })
        var str3 = comps({
        	template: '{%> title /%}{%> name /%}',
        	data: {
        		title: 'hello',
        		name: 'world'
        	}
        })
        assert.equal(str, '<div r-component="c-output-case-8"><div class="header" r-component="c-header"></div></div>')
        assert.equal(str2, '<div r-component="c-output-case-8"></div>')
        assert.equal(str3, 'helloworld')
    })
    it('data tag', function () {
        var r = comps({
            template: '{%data link="\'<a>hello</a>\'"%}{%> link /%}{%/data%}'
        })
        assert.equal(r, '<a>hello</a>')
    })
    it('data tag before component', function () {
        var r = comps({
            template: '{%data isShowHeader="true"%}{% component $id="output-case-8" $data="isShowHeader: isShowHeader"/%}{%/data%}'
        })
        assert.equal(r, '<div r-component="c-output-case-8"><div class="header" r-component="c-header"></div></div>')
    })
    it('repeat', function () {
        var str = comps({
            template: '{% repeat $items="[1,2,3,4]"%}{%> $value /%}{%/repeat%}',
        })
        assert.equal(str, '1234')
        str = comps({
            template: '{% repeat $items="[1,2]"%}{% component $id="output-case-8" $data="{ isShowHeader: !$index }"/%}{%/repeat%}',
        })
        assert.equal(str, '<div r-component="c-output-case-8"><div class="header" r-component="c-header"></div></div><div r-component="c-output-case-8"></div>')
        str = comps({
            template: '{% repeat $items="[1,2]" $as="item" $index="index"%}{%? index %}<div>{%> item /%}</div>{%/?%}{%/repeat%}',
        })
        assert.equal(str, '<div>2</div>')

    })
})
