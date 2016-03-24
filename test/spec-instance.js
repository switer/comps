'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Instance', function () {
    it('Create two instance with custom tag', function () {
    	var compsA = comps.create()
    	var compsB = comps.create()
    	compsA.tag('test', {
            paired: false,
            outer: function () {
                return ['<test>', '</test>']
            },
            inner: function () {
                return 'A'
            }
        })
        compsB.tag('test', {
            paired: false,
            outer: function () {
                return ['<test>', '</test>']
            },
            inner: function () {
                return 'B'
            }
        })
        assert.equal(compsA({
        	template: '{% test /%}'
        }), '<test>A</test>')
        assert.equal(compsB({
        	template: '{% test /%}'
        }), '<test>B</test>')
    })
    it('Create two instance using different resolve method', function () {
    	var compsA = comps.create()
    	var compsB = comps.create()
    	compsA.componentLoader(function (name) {
		    return {
		        request: name + '/' + name + '.tpl',
		        content: '<A-' + name + '/>'
		    }
		})
		compsB.componentLoader(function (name) {
		    return {
		        request: name + '/' + name + '.tpl',
		        content: '<B-' + name + '/>'
		    }
		})
        assert.equal(compsA({
        	template: '{% component $id="header" /%}'
        }), '<A-header/>')
        assert.equal(compsB({
        	template: '{% component $id="header" /%}'
        }), '<B-header/>')
    })
})