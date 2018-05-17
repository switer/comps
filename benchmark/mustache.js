var mustache = require('mustache')
var data = require('./data')
var count = process.env.COUNT || 10000
var template = `
<ul>
	{{#list}}
	<li>{{name}}{{age}}</li>
	{{/list}}
</ul>`
mustache.parse(template)
data = {list: data}
// console.log(mustache.render(template, data))
console.time('Mustache')
while (count --) {
	mustache.render(template, data)
}
console.timeEnd('Mustache')
