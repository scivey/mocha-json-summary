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

SuiteStack.prototype.pop = function(suiteName) {
    this._suites.pop();
    this._updateSuiteName();
};

module.exports = SuiteStack;