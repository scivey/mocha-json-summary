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
