'use strict';
var path = require('path');
var _ = require('underscore');
var sinon = require('sinon');
var assert = require('chai').assert;

var inLib = function() {
    var shallow = true;
    return path.join.apply(null, _.flatten([__dirname, '../lib', arguments], shallow));
};

var SuiteStack = require(inLib('suiteStack'));

describe('SuiteStack', function() {

    describe('Unit', function() {
        var stack;
        beforeEach(function() {
            stack = new SuiteStack();
        });

        describe('#_joinSuites', function() {
            it('works', function() {
                var someSuites = ['foo', 'bar'];
                assert.equal(stack._joinSuites(someSuites), 'foo__bar');
            });
        });

        describe('#_updateSuiteName', function() {
            it('works', function() {
                stack._joinSuites = sinon.stub();
                stack._suites = ['foo'];
                stack._currentSuiteName = 'oldName';
                stack._joinSuites.withArgs(stack._suites).returns('updatedName');
                stack._updateSuiteName();
                assert.equal(stack._currentSuiteName, 'updatedName');
            });
        });

        describe('#_currentSuiteName', function() {
            it('works', function() {
                stack._currentSuiteName = 'foo';
                assert.equal(stack.currentSuiteName(), 'foo');
            });
        });

        describe('#push', function() {
            it('works', function() {
                stack._suites = [];
                stack._updateSuiteName = sinon.stub();
                stack.push('someSuite');
                assert.deepEqual(stack._suites, ['someSuite']);
                sinon.assert.calledOnce(stack._updateSuiteName);

                stack.push('subSuite');
                assert.deepEqual(stack._suites, ['someSuite', 'subSuite']);
                sinon.assert.calledTwice(stack._updateSuiteName);
            });
        });

        describe('#pop', function() {
            it('works', function() {
                stack._suites = {
                    pop: sinon.stub()
                };
                stack._updateSuiteName = sinon.stub();
                stack.pop();
                sinon.assert.calledOnce(stack._suites.pop);
                sinon.assert.calledOnce(stack._updateSuiteName);
            });
        });

    });

    describe('Functional', function() {
        var stack;
        beforeEach(function() {
            stack = new SuiteStack();
        });
        it('works - 1', function() {
            stack.push('one');
            stack.push('two');
            assert.equal(stack.currentSuiteName(), 'one__two');
        });
        it('works - 2', function() {
            stack.push('one');
            stack.push('two');
            assert.equal(stack.currentSuiteName(), 'one__two');
            stack.pop();
            assert.equal(stack.currentSuiteName(), 'one');
            stack.push('a');
            stack.push('b');
            assert.equal(stack.currentSuiteName(), 'one__a__b');
            stack.pop();
            assert.equal(stack.currentSuiteName(), 'one__a');
        });
    });
});
