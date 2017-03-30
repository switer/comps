var __$compiledExprs__ ={}
function __$compile__() {
	var __$expr__ = arguments[0]
	var __$fn__ = __$compiledExprs__[__$expr__]
	if (!__$fn__) {
		__$fn__ = __$compiledExprs__[__$expr__] = new Function('$scope', 'with($scope){ return (' + __$expr__ + ')}')
	}
    return __$fn__
}
module.exports = function (/*expression, scope*/) {
    return __$compile__(arguments[0])(arguments[1] || {})
}
