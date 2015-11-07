'use strict';

var fs = require('fs')
var Comps = require('../index')

Comps.compile(fs.readFileSync(__dirname + '/index.tpl', 'utf-8'))