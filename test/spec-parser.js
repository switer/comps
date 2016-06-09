var assert = require('assert')
var comps = require('../index')

describe('Bigpipe', function () {
    it('parse attributes', function () {
    	var expr = "{%> $get('horizonal') ? 'result_item_h' : 'result_item_v'/%}"

    	var r = comps({
    		template: '<div class="_clazz ' + expr + '"></div>'
    	})
    	console.log(r)
    })
})