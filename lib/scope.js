'use strict'

var util = require('./util')

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

module.exports = Scope