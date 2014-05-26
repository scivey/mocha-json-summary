var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var assert = require('assert');

var inLib = function(file) {
    return path.join(__dirname, '../lib', file);
};

var inDir = function() {
    return path.join.apply(null, _.flatten([__dirname, arguments], true));
};

var inLib = function(file) {
    return inDir('../lib', file);
};

var deepEqual = require('deep-eql');

var Mocha = require('mocha');

var Reporter = require(inLib('reporterLib')).Reporter;

Reporter.prototype.onEnd = function() {
    var summary = this.summarize();
    console.log(JSON.stringify(summary));
};

var mocha = new Mocha();
mocha.ui('bdd');
mocha.reporter(Reporter);

var files = _.map(['test_math.js', 'test_strings.js'], function(oneFile) {
    return inDir('sample_tests', oneFile);
});

mocha.files = files;
mocha.run();
