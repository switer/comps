'use strict';

var fs = require('fs')
var comps = require('../index')

comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl', 'utf-8')
})
comps.componentTransform(function (name) {
    this.$attributes['r-component'] = 'c-' + name
})

var tpl = fs.readFileSync(__dirname + '/index.tpl', 'utf-8')
console.time('render')
var html = comps({
    template: tpl,
    // pagelet: 'main.head'
})
console.timeEnd('render')
console.log(html)