var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var inLib = function(file) {
    return path.join(__dirname, '../lib', file);
};

var inDir = function() {
    return path.join.apply(null, _.flatten([__dirname, arguments], true));
};

var inLib = function(file) {
    return inDir('../lib', file);
};

var Mocha = require('mocha');

var Reporter = require(inLib('reporterLib')).Reporter;

Reporter.prototype.onEnd = function() {
    console.warn('DONE');
    console.warn(this.summarize());
};

var mocha = new Mocha();
mocha.ui('bdd');
mocha.reporter(Reporter);

mocha.files.push(inDir('sample_tests/test_math.js'));
mocha.run();
