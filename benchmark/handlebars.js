var handlebars = require('handlebars')
var data = require('./data')
var count = process.env.COUNT || 10000
var template = handlebars.compile(`
<ul>
	{{#each list}}
	<li>{{name}}{{age}}</li>
	{{/each}}
</ul>`)
data = {list: data}
// console.log(template(data))
console.time('Handlebars')
while (count --) {
	template(data)
}
console.timeEnd('Handlebars')
