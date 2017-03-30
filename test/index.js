'use strict';

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var comps = require('../index')

comps.set({
    root: __dirname,
    componentDir: 'c'
})
comps.componentLoader(function () {
    var obj = comps.defaultComponentLoader.apply(this, arguments)
    obj.content = obj.content.replace(/\r?\n\s+/g, '')
    return obj
})
comps.fileLoader(function () {
    var obj = comps.defaultFileLoader.apply(this, arguments)
    obj.content = obj.content.replace(/\r?\n\s+/g, '')
    return obj
})
comps.componentTransform(function (name) {
    this.$attributes['r-component'] = 'c-' + path.basename(name)
})

require('./spec-instance.js')
require('./spec-classmethods.js')
require('./spec-component.js')
require('./spec-pagelet.js')
require('./spec-include.js')
require('./spec-bigpipe.js')
require('./spec-output.js')
require('./spec-parser.js')
require('./spec-tag.js')

