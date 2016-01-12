'use strict'

var assert = require('assert')
var comps = require('../index')

describe('Pagelet', function () {
    it('Render pagelet by id', function () {
        var r = comps({
            pagelet: 'header',
            template: '<div>{% pagelet $id="header"%}<div class="header"></div>{%/pagelet%}</div>'
        })
        assert.equal(r, '<div class="header"></div>')
    })
    it('Render nested pagelet', function () {
        var r = comps({
            pagelet: 'header.content',
            template: '<div>{% pagelet $id="header" %}{% pagelet $id="content" $wrap=true %}<div class="header-content"></div>{%/pagelet%}{% pagelet $id="content" $wrap=true %}<div class="header-content2"></div>{%/pagelet%}{%/pagelet%}</div>'
        })
        assert.equal(r, '<div data-pageletid="header.content"><div class="header-content"></div></div><div data-pageletid="header.content"><div class="header-content2"></div></div>')
    })
    it('Render nested pagelet with another pagelets', function () {
        var r = comps({
            pagelet: 'header.content',
            template: '{% pagelet $id="content" %}<div class="another-content"></div>{%/pagelet%}<div>{% pagelet $id="header"%}{% pagelet $id="content" $wrap="true" %}<div class="header-content"></div>{%/pagelet%}{% pagelet $id="content2" %}<div class="header-content2"></div>{%/pagelet%}{%/pagelet%}</div>'
        })
        assert.equal(r, '<div data-pageletid="header.content"><div class="header-content"></div></div>')
    })
    it('Render pagelet inside component', function () {
        var r = comps({
            pagelet: 'footerlink',
            template: '{% component $id="footer"/%}'
        })
        assert.equal(r, '<a href="" class="link" r-component="c-footer"></a>')
    })
    it('Render pagelet no wrapper', function () {
        var r = comps({
            pagelet: 'content',
            template: '{% pagelet $id="content" $wrap=false %}<div>content...</div>{% /pagelet %}'
        })
        assert.equal(r, '<div>content...</div>')
    })
})