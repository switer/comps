'use strict'

var util = require('./util')
var execute = require('./execute')

function Scope(data, parent) {
    util.extend(this, parent, data)
    this.$parent = parent || null
}
Scope.prototype.$root = function () {
    var root = this
    while(root.$parent) {
        root = root.$parent
    }
    return root
}
Scope.prototype.$clone = function (deep) {
    var cscope = new Scope()
    util.extend(cscope, this)
    // for performance, default disable
    if (deep) {
        cscope.$data = util.extend({}, cscope.$data)
    }
    return cscope
}
Scope.prototype.$execute = function (expr, data) {
    var $data = data || this.$data
    return execute(expr, util.extend({}, $data, {
        '$data': $data || {},
        '$exist': function (prop) {
            return $data && util.hasProp($data, prop)
        },
        '$get': function (prop) {
            if (!$data) return
            return $data[prop]
        }
    }))
}
module.exports = Scope