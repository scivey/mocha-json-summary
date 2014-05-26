var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var assert = require('assert');
var AssertionError = assert.AssertionError;

var inspect = (function() {
    var util = require('util');
    var opts = {
        colors: true,
        depth: null
    };
    return function(ref) {
        console.log(util.inspect(ref, opts));
    };
})();

var inLib = function(file) {
    return path.join(__dirname, '../lib', file);
};

var inDir = function() {
    return path.join.apply(null, _.flatten([__dirname, arguments], true));
};

var inLib = function(file) {
    return inDir('../lib', file);
};

var spawn = require('child_process').spawn;
var fork = require('child_process').fork;
var difflet = require('difflet');
var runner = fork(inDir('runner-cli.js'), [], {silent: true});

var deepEqual = function(x, y) {
    var equal = true;
    try {
        assert.deepEqual(x, y);
    } catch (e) {
        equal = false;
    }
    return equal;
};

var diff = difflet({
    indent: 4,
    comment: true
});

runner.stdout.on('data', function(data) {
    data = JSON.parse(data);
    var expected = {
        __math__add: {
            tests: [
                {
                    title: 'works'
                }
            ],
            failingTests: []
        },
        __math__sub: {
            tests: [
                {
                    title: 'works'
                }
            ],
            failingTests: []
        },
        __math__div: {
            tests: [
                {
                    title: 'works'
                }
            ],
            failingTests: []
        },
        __strings__contains: {
            tests: [
                {
                    title: 'works'
                }
            ],
            failingTests: []
        },
        __strings__without: {
            tests: [
                {
                    title: 'works'
                },
                {
                    title: 'fails embarassingly'
                }
            ],
            failingTests: [
                {
                    test: {
                        title: 'fails embarassingly'
                    },
                    suite: '__strings__without',
                    err: {
                        name: 'AssertionError',
                        message: 'expected \'fish\' to equal \'capybaras\'',
                        showDiff: false,
                        actual: 'fish',
                        expected: 'capybaras',
                        stack: '{{stack truncated}}'
                    }
                }
            ]
        }
    };
    data.__strings__without.failingTests[0].err.stack = '{{stack truncated}}';
    var eq = deepEqual(expected, data);
    if (!eq) {
        console.log(diff.compare(expected, data));
        process.exit(1);
    } else {
        console.log('Success.');
    }
});
