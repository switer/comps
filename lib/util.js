'use strict';

var ATTParser = require('attribute-parser')

module.exports = {
    type: function (obj) {
        return /\[object (\w+)\]/.exec(Object.prototype.toString.call(obj))[1].toLowerCase()
    },
    extend: function(obj) {
        if (this.type(obj) != 'object') return obj;
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                obj[prop] = source[prop];
            }
        }
        return obj;
    },
    hasProp: function(o, prop) {
        return o.hasOwnProperty(prop)
    },
    isUndef: function(o) {
        return o === void(0)
    },
    attributeStringify: function(atts) {
        return Object.keys(atts).reduce(function (result, item) {
            if (!/^\$/.test(item)) result.push( item + '="' + atts[item] + '"')
            return result
        }, []).join(' ')
    },
    attributesExclude: function (atts, reg) {
        if (!atts) return atts
        var next = {}
        Object.keys(atts).forEach(function (k) {
            if (reg.test(k)) return
            next[k] = atts[k]
        })
        return next
    },
    mergeTag: function (html, attrs) {
        var that = this
        return !attrs ? html : html.replace(
            new RegExp('^(\\s*)<([\\w\\-]+)([^\>]*?)(/?>)', 'm'), // get element open tag html
            function (m, space, name, attStr, end) {
                var nodeAttrs = ATTParser(attStr)
                var attributes = that.extend({}, nodeAttrs, attrs) // passing attributes first
                // merge class
                if (nodeAttrs.class && attrs.class) {
                    attributes['class'] = nodeAttrs.class + ' ' + attrs.class
                }
                attributes = that.attributeStringify(attributes)
                return space + '<' + name + (attributes ? ' ' + attributes : '') + end
            }
        )
    }
}