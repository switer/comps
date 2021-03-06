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
    it('$inner method of tag', function () {
        comps.tag('#', {
            paired: true,
            outer: function () {
                return ['#', '#']
            },
            inner: function () {
                return this.$inner()
            }
        })
        var r = comps({
            template: '{%#%}{% component $id="header"/%}{%/#%}'
        })
        assert.equal(r, '#<div class="header" r-component="c-header"></div>#')
    })
})
describe('Class-Methods: aspect()', function () {
    var _comps = comps.create()
    _comps.componentLoader(function (name) {
        var fpath = __dirname + '/c/' + name + '/' + name + '.tpl'
        return {
            request: fpath,
            content: require('fs').readFileSync(fpath, 'utf-8').replace(/\r?\n\s+/g, '')
        }
    })

    it('render aspect', function () {
        _comps.aspect('component', {
            render: function (innerHTML) {
                return '<div class="wrap">' + innerHTML + '</div>'
            }
        })
        var r = _comps({
            template: '{% component $id="header"/%}'
        })
        assert.equal(r, '<div class="wrap"><div class="header"></div></div>')
    })
    it('beforeCreated aspect', function () {
        _comps.aspect('component', {
            beforeCreated: function () {
                this._with = this.$attributes.with
                delete this.$attributes.with
            },
            render: function (innerHTML) {
                return '<div class="wrap" data-with="' + this._with + '">' + innerHTML + '</div>'
            }
        })
        var r = _comps({
            template: '{% component $id="header" with="data"/%}'
        })
        assert.equal(r, '<div class="wrap" data-with="data"><div class="header"></div></div>')
    })
    it('beforeInner aspect', function () {
        _comps.aspect('component', {
            beforeInner: function () {
                this.content = 'apsect content'
            }
        })
        var r = _comps({
            template: '{% component $id="header"/%}'
        })
        assert.equal(r, 'apsect content')
    })
    it('beforeOuter aspect', function () {
        _comps.aspect('component', {
            beforeOuter: function () {
                this.$attributes.with = 'data'
            }
        })
        var r = _comps({
            template: '{% component $id="header"/%}'
        })
        assert.equal(r, '<div class="header" with="data"></div>')
    })
})