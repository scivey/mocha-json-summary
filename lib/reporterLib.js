var SuiteTracker = require('./suiteTracker');

var support = require('./support');

var reporter = {};

var Reporter = function(runner) {
    Reporter.__super__.call(this, runner);
    this.initialize(runner);
};

Reporter.setMocha = function(mocha) {
    if (mocha.reporters) {
        this.__super__ = mocha.reporters.Base;
    } else {
        this.__super__ = mocha.constructor.reporters.Base;
    }
};
Reporter.__super__ = function(){};

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
    var trackerSummary = this._tracker.summarize();
    trackerSummary.stats = this.stats;
    return trackerSummary;
};


module.exports = reporter;
if (exports) {
    exports = module.exports;
}
