var path = require('path');
var _ = require('underscore');
var sinon = require('sinon');
var assert = require('chai').assert;

var inLib = function() {
    var shallow = true;
    return path.join.apply(null, _.flatten([__dirname, '../lib', arguments], true));
};

var SuiteTracker = require(inLib('suiteTracker'));
var SuiteStack = require(inLib('suiteStack'));


describe('SuiteTracker', function() {

    describe('Unit', function() {
        var tracker, stack;
        beforeEach(function() {
            tracker = new SuiteTracker();
            stack = {};
            tracker._stack = stack;
        });

        describe('#hasSuite', function() {
            it('works', function() {
                assert.deepEqual(tracker._suiteHash, {});
                assert.notOk(tracker.hasSuite('foo'));
                tracker._suiteHash.foo = 'somthing';
                assert.ok(tracker.hasSuite('foo'));
            });
        });

        describe('#_makeSuiteObject', function() {
            it('works', function() {
                assert.deepEqual(tracker._makeSuiteObject(), {
                    tests: [],
                    failingTests: []
                });
            });
        });

        describe('#_ensureSuiteHash', function() {
            it('works', function() {
                stack.currentSuiteName = sinon.stub();
                stack.currentSuiteName.returns('some_suite');
                tracker._makeSuiteObject = sinon.stub();
                var mockSuite1 = {one: true};
                var mockSuite2 = {two: true};
                tracker._makeSuiteObject
                    .onCall(0).returns(mockSuite1)
                    .onCall(1).returns(mockSuite2);
                tracker.hasSuite = sinon.stub();
                tracker.hasSuite.withArgs('some_suite')
                    .onCall(0).returns(false)
                    .onCall(1).returns(true)
                    .onCall(2).returns(false);

                assert.notOk(tracker._suiteHash.some_suite);
                
                tracker._ensureSuiteHash();
                assert.equal(mockSuite1, tracker._suiteHash.some_suite);               
                tracker._ensureSuiteHash();
                assert.equal(mockSuite1, tracker._suiteHash.some_suite);
                tracker._ensureSuiteHash();
                assert.equal(mockSuite2, tracker._suiteHash.some_suite);
            });
        });


        // SuiteTracker.prototype._currentSuiteSummary = function() {
        //     this._ensureSuiteHash();
        //     return this._suiteHash[this._stack.currentSuiteName()];
        // };

        describe('#_currentSuiteSummary', function() {
            it('works', function() {
                tracker._suiteHash.foo = 'bar';
                stack.currentSuiteName = sinon.stub().returns('foo');
                tracker._ensureSuiteHash = sinon.stub();
                assert.equal(tracker._currentSuiteSummary(), 'bar');
                sinon.assert.calledOnce(tracker._ensureSuiteHash);
            });
        });

        describe('#currentSuiteName', function() {
            it('works', function() {
                assert.ok(stack);
                assert.ok(tracker);
                stack.currentSuiteName = sinon.stub().returns('foo');
                assert.equal(tracker.currentSuiteName(), 'foo');
                sinon.assert.calledOnce(stack.currentSuiteName);
            });
        });

        describe('#pushSuite', function() {
            it('works', function() {
                stack.push = sinon.stub();
                var suite = {
                    title: 'foo'
                };
                tracker.pushSuite(suite);
                sinon.assert.calledWith(stack.push, 'foo');
            });
        });

        describe('#popSuite', function() {
            it('works', function() {
                stack.pop = sinon.stub();
                tracker.popSuite();
                sinon.assert.calledOnce(stack.pop);
            });
        });

        describe('#cleanTest', function() {
            it('works', function() {
                var aTest = {
                    title: 'foo',
                    other: 'bar'
                };
                assert.deepEqual({
                    title: 'foo'
                }, tracker.cleanTest(aTest));
            });
        });

        describe('#addTest', function() {
            it('works', function() {
                var cleaned = {};
                var test = {};
                var mockArray = {
                    push: sinon.stub()
                };
                tracker.cleanTest = sinon.stub().returns(cleaned);
                tracker._currentSuiteSummary = sinon.stub().returns({
                    tests: mockArray
                });
                tracker.addTest(test);
                sinon.assert.calledWith(tracker.cleanTest, test);
                sinon.assert.calledWith(mockArray.push, cleaned);
                sinon.assert.calledOnce(tracker._currentSuiteSummary);
            });
        });

        describe('#cleanFailingTest', function() {
            it('works', function() {
                var mockTest = {
                    title: 'someTest'
                };
                var err = {err: true};
                var suiteName = 'foo';
                assert.deepEqual({
                    test: {
                        title: 'someTest'
                    },
                    err: err,
                    suite: 'foo'
                }, tracker.cleanFailingTest(mockTest, err, suiteName));
            });
        });

        describe('#addFailingTest', function() {
            it('works', function() {
                var err = {err: true};
                var test = {test: true};
                var cleaned = {cleaned: true};
                var mockArray = {
                    push: sinon.stub()
                };
                tracker.cleanFailingTest = sinon.stub().returns(cleaned);
                tracker._currentSuiteSummary = sinon.stub().returns({
                    failingTests: mockArray
                });
                tracker.currentSuiteName = sinon.stub().returns('some_suite');
                tracker.addFailingTest(test, err);
                sinon.assert.calledOnce(tracker.currentSuiteName);
                sinon.assert.calledWith(tracker.cleanFailingTest, test, err, 'some_suite');
                sinon.assert.calledWith(mockArray.push, cleaned);
            });
        });

        describe('#summarize', function() {
            it('works', function() {
                var suites = {};
                tracker._suiteHash = suites;
                assert.equal(tracker.summarize(), suites);                
            });
        });
    });
    describe('Functional', function() {
        var tracker;
        beforeEach(function() {
            tracker = new SuiteTracker();
        });
        it('works', function() {
            assert.instanceOf(tracker._stack, SuiteStack);

            var toSpy = ['push', 'pop', 'currentSuiteName'];
            _.each(toSpy, function(method) {
                sinon.spy(tracker._stack, method);
            });

            var stack = tracker._stack;

            tracker.pushSuite({title: 'foo'});
            tracker.pushSuite({title: 'bar'});
            tracker.addTest({
                title: 'some_test'
            });
            tracker.addTest({
                title: 'another_test'
            });
            tracker.popSuite();
            tracker.addTest({
                title: 'yet_another'
            });
            tracker.pushSuite({title: 'baz'});
            tracker.addTest({
                title: 'they_keep_coming'
            });
            tracker.addFailingTest({
                title: 'some_failing_test'
            }, 'ErrorInstance');

            assert.deepEqual({
                foo: {
                    tests: [
                        {
                            title: 'yet_another'
                        }
                    ],
                    failingTests: []
                },
                foo__bar: {
                    tests: [
                        {
                            title: 'some_test'
                        },
                        {
                            title: 'another_test'
                        }
                    ],
                    failingTests: []
                },
                foo__baz: {
                    tests: [
                        {
                            title: 'they_keep_coming'
                        },
                    ],
                    failingTests: [
                        {
                            test: {
                                title: 'some_failing_test'
                            },
                            err: 'ErrorInstance',
                            suite: 'foo__baz'
                        }
                    ]
                }
            }, tracker.summarize());
            sinon.assert.calledThrice(stack.push);
            sinon.assert.called(stack.currentSuiteName);
            sinon.assert.calledOnce(stack.pop);
        });
    });
});
