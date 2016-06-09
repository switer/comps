'use strict';

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var comps = require('../index')

comps.componentLoader(function (name) {
    var fpath = __dirname + '/c/' + name + '/' + name + '.tpl'
    return {
        request: fpath,
        content: fs.readFileSync(fpath, 'utf-8').replace(/\r?\n\s+/g, '')
    }
})
comps.fileLoader(function (request, context) {
    var fpath = path.isAbsolute(request) 
        ? request
        : path.join(context, request)

    return {
        request: fpath,
        content: fs.readFileSync(fpath, 'utf-8').replace(/\r?\n\s+/g, '')
    }
})
comps.componentTransform(function (name) {
    this.$attributes['r-component'] = 'c-' + name
})

require('./spec-instance.js')
require('./spec-classmethods.js')
require('./spec-component.js')
require('./spec-pagelet.js')
require('./spec-include.js')
require('./spec-bigpipe.js')
require('./spec-output.js')
require('./spec-parser.js')

