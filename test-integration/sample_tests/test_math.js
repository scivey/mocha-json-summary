'use strict';
var assert = require('chai').assert;

var math = {
    add: function(x, y) {
        return x + y;
    },
    sub: function(x, y) {
        return x - y;
    },
    mul: function(x, y) {
        return x * y;
    },
    div: function(x, y) {
        return x / y;
    }
};


describe('math', function() {
    describe('add', function() {
        it('works', function() {
            assert.equal(math.add(5,3), 8);
        });
    });
    describe('sub', function() {
        it('works', function() {
            assert.equal(math.sub(10,3), 7);
        });
    });
    describe('div', function() {
        it('works', function() {
            assert.equal(math.div(12,6), 2);
        });
    });
});

