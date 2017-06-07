module.exports = (function () {
    var util = require('util');

    var ArrayValueValidator = function (property, parent, isIfExists) {
        this.property = property;

        this.parent = parent;

        this.and = parent;

        this.isIfExists = 'undefined' === typeof isIfExists ? false : !!isIfExists;

    }

    ArrayValueValidator.prototype.addRule = function (rule, arguments) {
        this.parent._parent.rules[this.property] = this.parent._parent.rules[this.property] || {};
        this.parent._parent.rules[this.property][rule] = arguments;
        this.parent._parent._ifExists[this.property] = this.isIfExists;

    }

    ArrayValueValidator.prototype.matches = function () {
        this.rules['matches'] = arguments;
        return this;
    }

    ArrayValueValidator.prototype.isInt = function () {
        this.addRule('isInt', arguments);
        return this;
    }

    ArrayValueValidator.prototype.isFloat = function () {
        this.addRule('isFloat', arguments);
        return this;
    }

    ArrayValueValidator.prototype.isAbove = function () {
        this.addRule('isAbove', arguments);
        return this;
    }

    ArrayValueValidator.prototype.isLess = function () {
        this.addRule('isLess', arguments);
        return this;
    }

    ArrayValueValidator.prototype.exists = function () {
        this.addRule('exists', arguments);
        return this;
    }

    ArrayValueValidator.prototype.escape = function () {
        this.addRule('escape', arguments);
        return this.parent;
    }

    ArrayValueValidator.prototype.return = function () {
        return this.parent.return();
    }

    return ArrayValueValidator;
})();