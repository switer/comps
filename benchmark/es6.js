var comps = require('../index.js')
var addons = require('comps-autonode-addons')
var data = require('./data')
var count = process.env.COUNT || 10000
addons(comps)
var template = comps({
	template: `
	<ul>
	{%foreach $arr="list"%}
		<li>\${$value.name}\${$value.age}</li>
	{%/foreach%}
	</ul>
	`
})
template = new Function('list', 'return `' + template + '`')
console.time('ES6-String')
while (count --) {
	template(data)
}
console.timeEnd('ES6-String')
