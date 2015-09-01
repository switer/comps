'use strict';

module.exports = function (str) {

	var attParts = str.split(/\s+/)
	var attSpaces = str.match(/\s+/gm)
	var attrs = []
	var openAttr

	attParts.forEach(function (item, index) {
		if (!item) return
		if (openAttr) {
			var space = attSpaces[index - 1]
			item = openAttr.open + space + item
			if (openAttr.close.test(item)) {
				openAttr = null
				var attMatches = item.match(/^([^\s\=]*?)\=['"]([\s\S]*?)['"]$/m)
				return attrs.push({
					name: attMatches[1],
					value: attMatches[2]
				})
			} else {
				openAttr.open = item
			}
			return
		} 

		var quotes = item.match(/^([^\s\=]*?)\=('|")([\s\S]*)$/m)
		if (quotes) {
			var reg
			switch (quotes[2]) {
				case '"':
					reg = /"$/
					break
				case "'":
					reg = /'$/
					break
			}
			if (reg.test(item)) 
				return attrs.push({
					name: quotes[1],
					value: quotes[3].replace(reg, '')
				})
			else {
				return openAttr = {
					open: item,
					close: reg
				}
			}
		} 
		var valueDirect = item.match(/^([^\s\=]*?)\=([\s\S]*?)$/m)
		if (valueDirect){
			return attrs.push({
				name: valueDirect[1],
				value: valueDirect[2]
			})
		}
		// key only attribute
		return attrs.push({
			name: item
		})
	})

	return attrs
}