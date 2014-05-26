var path = require('path');
var _ = require('underscore');
var sinon = require('sinon');
var assert = require('chai').assert;
var mocha = require('mocha');
var EventEmitter = require('events').EventEmitter;

var inLib = function() {
    var shallow = true;
    return path.join.apply(null, _.flatten([__dirname, '../lib', arguments], true));
};

var reporterLib = require(inLib('reporterLib'));

describe('Reporter', function() {
    var Reporter = reporterLib.Reporter;
    describe('Unit', function() {
        var BaseClass;
        beforeEach(function() {
            BaseClass = sinon.stub(reporterLib, 'Base');
        });
        afterEach(function() {
            BaseClass.restore();
        });
        describe('instantiation', function() {
            var stubs;
            beforeEach(function() {
                stubs = {};
                stubs.initialize = sinon.stub(Reporter.prototype, 'initialize');
            });
            afterEach(function() {
                _.each(stubs, function(aStub) {
                    aStub.restore();
                });
            });
            it('works', function() {
                var runner = {
                    total: 10
                };
                var rep = new Reporter(runner);
                sinon.assert.calledOnce(BaseClass);
                sinon.assert.calledWith(stubs.initialize, runner);
            });
        });
        describe('#initialize', function() {
            var stubs, initSpy;
            beforeEach(function() {
                stubs = {};
                _.each(['startListening'], function(method) {
                    stubs[method] = sinon.stub(Reporter.prototype, method);
                });
                initSpy = sinon.spy(Reporter.prototype, 'initialize');
            });
            afterEach(function() {
                _.each(stubs, function(aStub) {
                    aStub.restore();
                });
                initSpy.restore();
            });
            it('works', function() {
                var runner = {
                    total: 10
                };
                var rep = new Reporter(runner);
                sinon.assert.calledOnce(initSpy);
                sinon.assert.calledWith(stubs.startListening, runner);
            });
        });
        describe('#startListening', function() {
            it('works', function() {
                var reporter = {
                    _initListen: sinon.stub()
                };
                var runner = {};
                Reporter.prototype.startListening.call(reporter, runner);
                sinon.assert.calledWith(reporter._initListen, runner);
            });
        });
        describe('#setTracker and #getTracker', function() {
            var stubs;
            beforeEach(function() {
                stubs = {};
                stubs.initialize = sinon.stub(Reporter.prototype, 'initialize');
            });
            afterEach(function() {
                stubs.initialize.restore();
            });
            it('works - set', function() {
                var rep = new Reporter();
                rep.setTracker('foo');
                assert.equal(rep._tracker, 'foo');
            });
            it('works - get', function() {
                var rep = new Reporter();
                rep._tracker = 'bar';
                assert.equal(rep.getTracker(), 'bar');
            });
        });
        describe('#_initListen', function() {
            var runner, reporter, stubs;
            beforeEach(function() {
                stubs = {};
                stubs.startListening = sinon.stub(Reporter.prototype, 'startListening');
                runner = new EventEmitter();
                runner.total = 10;
                reporter = new Reporter(runner);
            });
            afterEach(function() {
                _.each(stubs, function(aStub) {
                    aStub.restore();
                });
            });
            it('works', function() {
                runner.on = sinon.stub();

                reporter._initListen(runner);
                sinon.assert.called(runner.on, 6);
                sinon.assert.calledWith(runner.on, 'suite');
                sinon.assert.calledWith(runner.on, 'suite end');
                sinon.assert.calledWith(runner.on, 'test');
                sinon.assert.calledWith(runner.on, 'fail');
                sinon.assert.calledWith(runner.on, 'start');
                sinon.assert.calledWith(runner.on, 'end');
            });
            it('handles `suite` events', function(done) {
                var tracker = {
                    pushSuite: sinon.stub()
                };
                var suite = {
                    title: 'foo'
                };
                reporter.getTracker = sinon.stub().returns(tracker);
                reporter._initListen(runner);
                _.defer(function() {
                    runner.emit('suite', suite);
                    _.defer(function() {
                        sinon.assert.calledWith(tracker.pushSuite, suite);                        
                        done();
                    });
                });
            });
            it('handles `suite end` events', function(done) {
                var tracker = {
                    popSuite: sinon.stub()
                };
                var suite = {
                    title: 'foo'
                };
                reporter.getTracker = sinon.stub().returns(tracker);
                reporter._initListen(runner);
                _.defer(function() {
                    runner.emit('suite end', suite);
                    _.defer(function() {
                        sinon.assert.calledOnce(tracker.popSuite);                        
                        done();
                    });
                });
            });
            it('handles `test` events', function(done) {
                var tracker = {
                    addTest: sinon.stub()
                };
                var test = {
                    title: 'some_test'
                };
                var err = {};
                reporter.getTracker = sinon.stub().returns(tracker);
                reporter._initListen(runner);
                _.defer(function() {
                    runner.emit('test', test);
                    _.defer(function() {
                        sinon.assert.calledWith(tracker.addTest, test);
                        done();
                    });
                });
            });
            it('handles `fail` events', function(done) {
                var tracker = {
                    addFailingTest: sinon.stub()
                };
                var test = {
                    title: 'some_test'
                };
                var err = {};
                reporter.getTracker = sinon.stub().returns(tracker);
                reporter._initListen(runner);
                _.defer(function() {
                    runner.emit('fail', test, err);
                    _.defer(function() {
                        sinon.assert.calledWith(tracker.addFailingTest, test, err);
                        done();
                    });
                });
            });
            it('handles `start` events', function(done) {
                reporter.onStart = sinon.stub();
                reporter.getTracker = sinon.stub().returns({});
                reporter._initListen(runner);
                _.defer(function() {
                    runner.emit('start');
                    _.defer(function() {
                        sinon.assert.calledOnce(reporter.onStart);
                        done();
                    });
                });
            });
            it('handles `end` events', function(done) {
                reporter.onEnd = sinon.stub();
                reporter.getTracker = sinon.stub().returns({});
                reporter._initListen(runner);
                _.defer(function() {
                    runner.emit('end');
                    _.defer(function() {
                        sinon.assert.calledOnce(reporter.onEnd);
                        done();
                    });
                });
            });
        });
    });
});
