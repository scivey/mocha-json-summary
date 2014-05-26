!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.AReporter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Reporter = _dereq_('./lib/reporterLib').Reporter;

module.exports = Reporter;

},{"./lib/reporterLib":2}],2:[function(_dereq_,module,exports){
'use strict';
var SuiteTracker = _dereq_('./suiteTracker');

var support = _dereq_('./support');

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

    runner.on('suite end', function() {
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

},{"./suiteTracker":4,"./support":5}],3:[function(_dereq_,module,exports){
'use strict';
var SuiteStack = function() {
    this._suites = [];
    this._currentSuiteName = '';
};

SuiteStack.prototype._joinSuites = function(suiteList) {
    return suiteList.join('__');
};

SuiteStack.prototype._updateSuiteName = function() {
    this._currentSuiteName = this._joinSuites(this._suites);
};

SuiteStack.prototype.currentSuiteName = function() {
    return this._currentSuiteName;
};

SuiteStack.prototype.push = function(suiteName) {
    this._suites.push(suiteName);
    this._updateSuiteName();
};

SuiteStack.prototype.pop = function() {
    this._suites.pop();
    this._updateSuiteName();
};

module.exports = SuiteStack;
},{}],4:[function(_dereq_,module,exports){
'use strict';
var SuiteStack = _dereq_('./suiteStack');

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

SuiteTracker.prototype.popSuite = function() {
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

},{"./suiteStack":3}],5:[function(_dereq_,module,exports){
'use strict';
var support = {};

support.extendProps = function(target, base) {
    var prop;
    for (prop in base) {
        if (base.hasOwnProperty(prop)) {
            target[prop] = base[prop];
        }
    }
};

support.multiExtendProps = function() {
    var args = Array.prototype.slice.call(arguments);
    var target = args[0];
    var bases = args.slice(1);
    bases.forEach(function(base) {
        support.extendProps(target, base);
    });
};

support.has = function(obj, prop) {
    return (!!obj[prop]) && obj.hasOwnProperty(prop);
};

// `extend` function is lifted from Backbone 1.1.2 and
// is the work of Jeremy Ashkenas, except modifications
// to remove underscore.js dependency.
// see http://backbonejs.org/


support.extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && support.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    support.multiExtendProps(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function() {
        this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        support.multiExtendProps(child.prototype, protoProps);
    }
    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

module.exports = support;

},{}]},{},[1])
(1)
});