var ejs = require('ejs')
var data = require('./data')
var count = process.env.COUNT || 10000
var template = ejs.compile(`
<ul>
<% list.forEach(function(user){ %>
	<li><%= user.name %><%= user.age %></li>
<% }) %>
</ul>`)
data = {list: data}
// console.log(template(data))
console.time('ejs')
while (count --) {
	template(data)
}
console.timeEnd('ejs')
