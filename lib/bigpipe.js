'use strict'

var EventEmitter = require('events')
var util = require('./util')

function nextTick (fn) {
    return process.nextTick(fn)
}

function BigPipe(chunks) {
    var data = {}
    var chunks = this._chunks = chunks.slice()

    Object.defineProperty(this, 'data', {
        get: function () {
            return data
        }
    })
    this._idIndexes = chunks.reduce(function (result, item, index) {
        if (item.id) result[item.id] = index
        return result
    }, {})
    // those compeleted dependences
    this._deps = {}
    this._waiting = []
    this._emiter = new EventEmitter()
    this.flush()
}
BigPipe.prototype.set = function (/*key[, value]|map|array*/) {
    if (this._ended) return this

    var args = arguments
    var firstType = util.type(args[0])
    if (firstType == 'string') {
        var key = args[0]
        this._deps[key] = true
        if (args.length >= 2) {
            this.data[key] = args[1]
        }

    } else if (firstType == 'object') {
        Object.keys(args[0]).forEach(function (k) {
            this._deps[k] = true
        }.bind(this))
        util.extend(this.data, map)

    } else if (firstType == 'array') {
        args[0].forEach(function (k) {
            this._deps[k] = true
        }.bind(this))
    } else {
        // has not change
        return this
    }
    this.flush()
    return this
}
BigPipe.prototype.endChunk = function (cid) {
    if (this._ended) return this

    var chunkIndex = this._idIndexes[cid]
    var chunk = this._chunks[chunkIndex]
    if (!chunk) {
        throw new Error('Can\'t not found chunk by id "' + cid + '"')
    } else {
        chunk.requires.forEach(function (dep) {
            this._deps[dep] = true
        }.bind(this))
        this.flush()
        return this
    }
}
/**
 * flush compeleted chunks in nextTick
 */
BigPipe.prototype.flush = function () {
    if (this._ended) return this
    // lock before nextTick
    if (this._pending) return
    this._pending = true
    nextTick(function () {
        this._pending = false
        if (!this._head) {
            // has not chunk to handle
            if (!this._chunks.length) {
                this.end()
                return this
            }
            this._head = this._chunks.shift()
        }
        // Collect those waiting dependences
        this._waiting = this._head.requires.reduce(function (clt, dep) {

            if (!this._deps[dep]) {
                if (!util.hasProp(this.data, dep)) {
                    // still waiting
                    clt.push(dep)
                } else {
                    // mark dependency as done
                    this._deps[dep] = true
                }
            }
            return clt
        }.bind(this), [])
        // All dependences is done
        if (!this._waiting.length) {
            // emit data for external
            this._emiter.emit('chunk', this._head.content)
            this._head = null
            this.flush()
        }
    }.bind(this))

    return this
}
BigPipe.prototype.end = function (shouldFlush) {
    // If shouldFlush is false, will not emit final data.
    if (!this._ended) {
        this._ended = true
        if (shouldFlush !== false && (this._head || this._chunks.length)) {
            var chunk = ''
            if (this._head) chunk += this._head.content

            chunk += this._chunks.reduce(function (result, item) {
                return result + item.content
            }, '')

            this._emiter.emit('chunk', chunk, this.data)
        }
        this._emiter.emit('end')
    }
    return this
}
BigPipe.prototype.on = function (event, handler) {
    var that = this
    var fn = handler.bind(this)
    this._emiter.on(event, fn)
    return function () {
        that._emiter.removeListener(event, fn)
    }
}

module.exports = BigPipe