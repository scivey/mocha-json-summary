var inLib = function(aFile) {
    var path = require('path');
    var shallow = true;
    return path.join(__dirname, aFile);
};

var mocha = require('mocha');

var SuiteTracker = require(inLib('suiteTracker'));

var support = require(inLib('support'));

var reporter = {
    Base: mocha.reporters.Base
};

var Reporter = function(runner) {
    reporter.Base.call(this, runner);
    this.initialize(runner);
};

reporter.Reporter = Reporter;
Reporter.extend = support.extend;

Reporter.prototype.initialize = function(runner) {
    this._total = runner.total;
    this.setTracker(new SuiteTracker());
    this.startListening(runner);
};

Reporter.prototype.setTracker = function(suiteTrackerInstance) {
    this._tracker = suiteTrackerInstance;
};

Reporter.prototype.getTracker = function() {
    return this._tracker;
};

Reporter.prototype.onStart = function() {};

Reporter.prototype.onEnd = function() {};

Reporter.prototype.startListening = function(runner) {
    this._initListen(runner);
};

Reporter.prototype._initListen = function(runner) {
    var tracker = this.getTracker();
    var self = this;
    runner.on('suite', function(suite) {
        tracker.pushSuite(suite);
    });

    runner.on('suite end', function(suite) {
        tracker.popSuite();
    });

    runner.on('test', function(test) {
        tracker.addTest(test);
    });

    runner.on('fail', function(test, err) {
        tracker.addFailingTest(test, err);
    });

    runner.on('start', function() {
        self.onStart();
    });

    runner.on('end', function() {
        self.onEnd();
    });
};

Reporter.prototype.summarize = function() {
    return this._tracker.summarize();
};

module.exports = reporter;
