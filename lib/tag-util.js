'use strict'

var ATTParser = require('attribute-parser')
var config = require('./config')
var util = require('./util')

module.exports = {
    wrap: function(name, raw) {
        return '"' + config.openTag + ' ' + name + ' ' + raw + ' ' + config.closeTag + '"'
    },
    merge: function (html, attrs) {
        return !attrs ? html : html.replace(
            new RegExp('^(\\s*)<([\\w\\-]+)([^\>]*?)(/?>)', 'm'), // get element open tag html
            function (m, space, name, attStr, end) {
                var nodeAttrs = ATTParser(attStr)
                var attributes = util.extend({}, nodeAttrs, attrs) // passing attributes first
                // merge class
                if (nodeAttrs.class && attrs.class) {
                    attributes['class'] = nodeAttrs.class + ' ' + attrs.class
                }
                attributes = util.attributeStringify(attributes)
                return space + '<' + name + (attributes ? ' ' + attributes : '') + end
            }
        )
    }
}