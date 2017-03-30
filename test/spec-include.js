'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Include', function () {
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
    it('Events: emit beforeload event', function (done) {
        var unwatch = comps.on('beforefileload', function (request, context, file) {
            assert.equal(file.$attributes.$path, 'tpls/include-case-5.tpl')
            assert.equal(request, 'tpls/include-case-5.tpl')
            assert.equal(file.request, 'tpls/include-case-5.tpl')
            assert(/\/test$/.test(context))
            assert(/\/test$/.test(file.context))
            unwatch()
            done()
        })
        var r = comps({
            context: __dirname,
            template: '{% include $path="tpls/include-case-5.tpl" /%}'
        })
        assert.equal(r.trim(), '<div class="case 5"><div class="main" r-component="c-main"><div class="header" r-component="c-header"></div><section class="part"></section>\n</div></div>')
    })
    it('Events: emit beforeloaded event', function (done) {
        var unwatch = comps.on('fileloaded', function (path, file) {
            assert.equal(file.$attributes.$path, 'tpls/include-case-5.tpl')
            assert(/test\/tpls\/include-case-5\.tpl/.test(path.request))
            assert.equal(path.content, '<div class="case 5">{% component $id="main" $replace=true /%}</div>')
            unwatch()
            done()
        })
        var r = comps({
            context: __dirname,
            template: '{% include $path="tpls/include-case-5.tpl" /%}'
        })
        assert.equal(r.trim(), '<div class="case 5"><div class="main" r-component="c-main"><div class="header" r-component="c-header"></div><section class="part"></section>\n</div></div>')
    })
    it('Passing data', function () {
        var r = comps({
            context: __dirname,
            template: '{% include $path="tpls/include-case-6.tpl" $data="{ outerContent: \'hello\' }"/%}'
        })
        assert.equal(r.trim(), '<div>hello</div>')
    })
})
