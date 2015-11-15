'use strict';

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
    }
}