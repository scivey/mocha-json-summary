var SuiteStack = require('./suiteStack');

var SuiteTracker = function() {
    this._stack = new SuiteStack();
    this._suiteHash = {};
    this._failingTests = [];
};

SuiteTracker.prototype._makeSuiteObject = function() {
    return {
        tests: [],
        failingTests: []
    };
};

SuiteTracker.prototype._ensureSuiteHash = function() {
    var suiteName = this._stack.currentSuiteName();
    if (!this.hasSuite(suiteName)) {
        this._suiteHash[suiteName] = this._makeSuiteObject();
    }
};

SuiteTracker.prototype._currentSuiteSummary = function() {
    this._ensureSuiteHash();
    return this._suiteHash[this._stack.currentSuiteName()];
};

SuiteTracker.prototype.currentSuiteName = function() {
    return this._stack.currentSuiteName();
};

SuiteTracker.prototype.hasSuite = function(suiteName) {
    return !!this._suiteHash[suiteName];
};

SuiteTracker.prototype.pushSuite = function(suite) {
    this._stack.push(suite.title);
};

SuiteTracker.prototype.popSuite = function(suite) {
    this._stack.pop();
};

SuiteTracker.prototype.cleanTest = function(test) {
    return {
        title: test.title
    };
};

SuiteTracker.prototype.addTest = function(test) {
    var cleaned = this.cleanTest(test);
    this._currentSuiteSummary().tests.push(cleaned);
};

SuiteTracker.prototype.cleanFailingTest = function(test, err, suiteName) {
    return {
        test: {
            title: test.title,
        },
        err: err,
        suite: suiteName
    };
};

SuiteTracker.prototype.addFailingTest = function(test, err) {
    var currentSuite = this.currentSuiteName();
    var cleaned = this.cleanFailingTest(test, err, currentSuite);
    this._currentSuiteSummary().failingTests.push(cleaned);
    this._failingTests.push(cleaned);
};

SuiteTracker.prototype.summarize = function() {
    return {
        suites: this._suiteHash,
        failingTests: this._failingTests
    };
};

module.exports = exports = SuiteTracker;
