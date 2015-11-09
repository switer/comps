'use strict';

var fs = require('fs')
var Comps = require('../index')

Comps.componentLoader(function (name) {
    return fs.readFileSync(__dirname + '/c/' + name + '/' + name + '.tpl', 'utf-8')
})
var tpl = fs.readFileSync(__dirname + '/index.tpl', 'utf-8')
console.time('render')
var html = Comps({
    template: tpl,
    // pagelet: 'main.head'
})
console.timeEnd('render')
console.log(html)