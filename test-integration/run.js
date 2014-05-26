'use strict';
var _ = require('underscore');
var path = require('path');
var assert = require('assert');

var inDir = function() {
    return path.join.apply(null, _.flatten([__dirname, arguments], true));
};

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


var isDateString = function(possibleDate) {
    var dateReg = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
    return dateReg.test(possibleDate);
};

var truncateErrorStack = function(oneTest) {
    if (oneTest && oneTest.err) {
        oneTest.err.stack = '{{stack truncated}}';
    }
};

var truncateSuiteErrors = function(aSuite) {
    if (aSuite.failingTests.length > 0) {
        _.each(aSuite.failingTests, truncateErrorStack);
    }
};

var cleanStats = function(stats) {
    if (stats.duration && _.isNumber(stats.duration)) {    
        stats.duration = '{{number removed}}';
    }
    if (stats.start && isDateString(stats.end)) {
        stats.start = '{{date removed}}';
    }
    if (stats.end && isDateString(stats.end)) {
        stats.end = '{{date removed}}';
    }
    return stats;
};

runner.stdout.on('data', function(data) {
    data = JSON.parse(data);
    var expected = {
        suites: {
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
                        title: 'fails embarassingly',
                        failing: true
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
        },
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
        ],
        stats: {
            suites: 7,
            tests: 6,
            passes: 5,
            failures: 1,
            pending: 0,
            duration: '{{number removed}}',
            start: '{{date removed}}',
            end: '{{date removed}}'
        }
    };

    truncateSuiteErrors(data);
    _.each(data.suites, truncateSuiteErrors);

    cleanStats(data.stats);

    var eq = deepEqual(expected, data);
    if (!eq) {
        console.log(diff.compare(expected, data));
        process.exit(1);
    } else {
        console.log('Success.');
    }
});
