module.exports = function (/*expression, scope*/) {
    var __$scope__ = arguments[1] || {}
    return eval('with(__$scope__){(' + arguments[0] + ')}')
}