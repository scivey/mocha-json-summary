'use strict';
var assert = require('chai').assert;

var strings = {
    contains: function(subString, toSearch) {
        return toSearch.indexOf(subString) !== -1;
    },
    without: function(subString, baseString) {
        var start = baseString.indexOf(subString);
        var stop = start + subString.length;
        return baseString.substring(0, start) + baseString.substring(stop);
    },
};

describe('strings', function() {
    describe('contains', function() {
        it('works', function() {
            assert.ok(strings.contains('foo', 'something_foo_somethingelse'));
        });
    });
    describe('without', function() {
        it('works', function() {
            var base = 'a string with words we dislike';
            var cleaned = strings.without('words', base);
            assert.equal(cleaned, 'a string with  we dislike');
        });
        it('fails embarassingly', function() {
            assert.equal('fish', 'capybaras');
        });
    });
});