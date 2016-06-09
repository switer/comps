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
                if(this.hasProp(source, prop)) obj[prop] = source[prop];
            }
        }
        return obj;
    },
    hasProp: function(o, prop) {
        return Object.prototype.hasOwnProperty.call(o, prop)
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
    warn: function () {
        console.log('[Comps][WARN]: ' + [].slice.call(arguments).join(' '))
    }
}