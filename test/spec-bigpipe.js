'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Bigpipe', function () {
    it('Using bcompile', function (done) {
        var creator = comps.bcompile('{%include $path="tpls/bigpipe-case-1.tpl"/%}', {
            context: __dirname
        })
        var bp = creator()
        var chunks = {
            0: '<div><div class="header" r-component="c-header"></div>',
            1: '<div class="list">list</div>\n</div>'
        }
        var cid = 0
        bp.on('chunk', function (chunk) {
            assert.equal(chunk, chunks[cid++])
        })
        bp.on('end', function () {
            if (cid !== 2) throw new Error('Not all chunks done.')
            done()
        })
    })
    it('Using bcompile without chunk', function (done) {
        var creator = comps.bcompile('{%include $path="tpls/bigpipe-case-2.tpl"/%}', {
            context: __dirname
        })
        var bp = creator()
        var result = '<div><div class="header" r-component="c-header"></div><div class="list">list</div>\n</div>'
        var receive
        bp.on('chunk', function (chunk) {
            receive = true
            assert.equal(chunk, result)
        })
        bp.on('end', function () {
            if (!receive) throw new Error('Chunk has not been received.')
            done()
        })
    })
    it('Require data', function (done) {
        var creator = comps.bcompile('{%include $path="tpls/bigpipe-case-3.tpl"/%}', {
            context: __dirname
        })
        var bp = creator()
        var chunks = {
            0: '<div><div class="header" r-component="c-header"></div>',
            1: '<div class="list">list</div>\n</div>'
        }
        var cid = 0
        bp.on('chunk', function (chunk) {
            assert.equal(chunk, chunks[cid++])
        })
        bp.on('end', function () {
            if (cid !== 2) throw new Error('Not all chunks done.')
            done()
        })
        setTimeout(function () {
            bp.data.header = ''
            bp.data.list = ''
            bp.flush()
        })
    })
    it('set() method', function (done) {
        var creator = comps.bcompile('{%include $path="tpls/bigpipe-case-4.tpl"/%}', {
            context: __dirname
        })
        var bp = creator()
        var chunks = {
            0: '<div><div class="header" r-component="c-header"></div>',
            1: '<div class="list">list</div>\n</div>'
        }
        var cid = 0
        bp.on('chunk', function (chunk) {
            assert.equal(chunk, chunks[cid++])
        })
        bp.on('end', function () {
            if (cid !== 2) throw new Error('Not all chunks done.')
            done()
        })

        bp.data.header = ''
        bp.set('header', 'title')
        assert.equal(bp.data.header, 'title')
        setTimeout(function () {
            var list = []
            bp.set('list', list)
            assert.equal(bp.data.list, list)
        })
    })
    it('endChunk() method', function (done) {
        var creator = comps.bcompile('{%include $path="tpls/bigpipe-case-5.tpl"/%}', {
            context: __dirname
        })
        var bp = creator()
        var chunks = {
            0: '<div><div class="header" r-component="c-header"></div>',
            1: '<div class="list">list</div>\n</div>'
        }
        var cid = 0
        bp.on('chunk', function (chunk) {
            var expect = chunks[cid++]
            assert.equal(chunk, expect)
        })
        bp.on('end', function () {
            if (cid !== 2) throw new Error('Not all chunks done.')
            done()
        })

        bp.endChunk('list')
        setTimeout(function () {
            bp.data.header = ''
            bp.set('header', 'title')
            assert.equal(bp.data.header, 'title')
        })
    })
    it('end() method', function (done) {
        var creator = comps.bcompile('{%include $path="tpls/bigpipe-case-5.tpl"/%}', {
            context: __dirname
        })
        var bp = creator()
        var result = '<div><div class="header" r-component="c-header"></div><div class="list">list</div>\n</div>'
        var cid = 0
        bp.on('chunk', function (chunk) {
            cid++
            assert.equal(chunk, result)
        })
        bp.on('end', function () {
            if (!cid) throw new Error('Chunk is not flush before ending.')
            done()
        })
        bp.end()
    })
})