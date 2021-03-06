'use strict';
var path = require('path');
var _ = require('underscore');
var sinon = require('sinon');
var assert = require('chai').assert;

var inLib = function() {
    var shallow = true;
    return path.join.apply(null, _.flatten([__dirname, '../lib', arguments], shallow));
};

var support = require(inLib('support'));

describe('support', function() {
    describe('Unit', function() {
        describe('extendProps', function() {
            it('extend properties', function() {
                var x = {
                    a: 5
                };
                var y = {
                    b: 2,
                    c: 3
                };
                support.extendProps(x, y);
                assert.deepEqual({
                    a: 5,
                    b: 2,
                    c: 3
                }, x);
                assert.deepEqual({
                    b: 2,
                    c: 3
                }, y);
            });
            it('overwrites existing properties', function() {
                var x = {
                    a: 5,
                    b: 7
                };
                var y = {
                    b: 2,
                    c: 3
                };
                support.extendProps(x, y);
                assert.deepEqual({
                    a: 5,
                    b: 2,
                    c: 3
                }, x);
                assert.deepEqual({
                    b: 2,
                    c: 3
                }, y);
            });
        });
        describe('multiExtendProps', function() {
            var extendProps;
            beforeEach(function() {
                extendProps = sinon.stub(support, 'extendProps');
            });
            afterEach(function() {
                extendProps.restore();
            });
            it('works', function() {
                var x = {
                    a: 5
                };
                var y = {
                    b: 3
                };
                var z = {
                    c: 10
                };
                support.multiExtendProps(x, y, z);
                sinon.assert.calledWith(extendProps, x, y);
                sinon.assert.calledWith(extendProps, x, z);
            });
        });
        describe('extend', function() {
            var Thing;
            beforeEach(function() {
                Thing = function(val) {
                    this.val = val;
                };
                Thing.prototype.getVal = function() {
                    return this.val;
                };
                Thing.prototype.setVal = function(newVal) {
                    this.val = newVal;
                };
            });
            it('is shamelessly lifted from Backbone.', function() {
                assert.ok(true);
            });
            it('extends prototypes', function() {
                var protoProps = {
                    increment: function() {
                        this.val += 1;
                    }
                };
                var ExtendedThing = support.extend.apply(Thing, [protoProps]);
                assert.notOk(Thing.prototype.increment);
                assert.isFunction(ExtendedThing.prototype.increment);
                assert.isFunction(ExtendedThing.prototype.setVal);
                assert.isFunction(ExtendedThing.prototype.getVal);
            });
            it('extends prototypes - with a constructor', function() {
                var protoProps = {
                    increment: function() {
                        this.val += 1;
                    },
                    constructor: function() {
                        this.val = 17;
                    }
                };
                var ExtendedThing = support.extend.apply(Thing, [protoProps]);
                assert.notOk(Thing.prototype.increment);
                assert.isFunction(ExtendedThing.prototype.increment);
                assert.isFunction(ExtendedThing.prototype.setVal);
                assert.isFunction(ExtendedThing.prototype.getVal);
                var thing = new ExtendedThing(10);
                assert.equal(thing.getVal(), 17);
            });
            it('extends static methods', function() {
                var staticMethods = {
                    factory: function(val) {
                        var Self = this;
                        return new Self(val);
                    }
                };
                var ExtendedThing = support.extend.apply(Thing, [{}, staticMethods]);
                assert.isFunction(ExtendedThing.factory);
                assert.notOk(Thing.factory);
                assert.isFunction(ExtendedThing.prototype.setVal);
                assert.isFunction(ExtendedThing.prototype.getVal);            
            });
            it('has a kind of effortless grace; has mannerisms which are widely considered attractive', function() {
                var protoProps = {
                    increment: function() {
                        this.val += 1;
                    }
                };
                var statics = {
                    factory: function(val) {
                        var Self = this;
                        return new Self(val);
                    }
                };
                var ExtendedThing = support.extend.apply(Thing, [protoProps, statics]);
                var thing = new ExtendedThing(10);
                assert.equal(thing.getVal(), 10);
                thing.increment();
                assert.equal(thing.getVal(), 11);
                thing.setVal(23);
                assert.equal(thing.getVal(), 23);
                var anotherThing = ExtendedThing.factory(17);
                assert.equal(anotherThing.getVal(), 17);
            });
        });
    });
    describe('functional', function() {
        describe('multiExtendProps', function() {
            it('works', function() {
                var x = {
                    a: 10,
                    b: 20,
                    c: 30,
                    d: 40
                };
                var y = {
                    b: 21,
                    c: 31
                };
                var z = {
                    c: 32,
                    e: 50
                };
                support.multiExtendProps(x, y, z);
                assert.deepEqual({
                    a: 10,
                    b: 21,
                    c: 32,
                    d: 40,
                    e: 50
                }, x);
            });
        });
    });
});
