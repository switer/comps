'use strict';

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var colors = require('colors')
var comps = require('../index')
var artTemplate = require('art-template')
var ejs = require('ejs')

comps.componentLoader(function (name) {
    var fpath = __dirname + '/tpls/' + name + '/' + name + '.tpl'
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
var list = [];
var n = 300000
while(n --) {
    list.push(n)
}
console.log('Time of render ' + `${list.length}`.green + ' items\n')
/**
 * Comps test
 */
var source = fs.readFileSync(__dirname + '/tpls/main/main.tpl', 'utf-8')
var tpl = comps({ template: source })
var render = new Function('data', 'return \`' + tpl + '\`')
console.time('Comps+ES6   '.green)
var r = render({
    list: list
})
console.timeEnd('Comps+ES6   '.green)
console.log('-------------------')

/**
 * artTemplate test
 */
var source = fs.readFileSync(__dirname + '/tpls/main/main.art.tpl', 'utf-8')
var atRender = artTemplate.compile(source)
console.time('art-template'.yellow.gray)
var r = atRender({
    list: list
})
console.timeEnd('art-template'.yellow.gray)
console.log('-------------------')

/**
 * artTemplate test
 */
var source = fs.readFileSync(__dirname + '/tpls/main/main.ejs.tpl', 'utf-8')
var ejsRender = ejs.compile(source)
console.time('ejs         '.red)
var r = ejsRender({
    list: list
})
console.timeEnd('ejs         '.red)
console.log('-------------------')
