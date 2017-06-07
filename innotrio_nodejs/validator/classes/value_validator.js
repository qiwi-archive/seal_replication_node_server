module.exports = (function () {
    var util = require('util');
    var Validator = require('./base_validator');

    var ValueValidator = function (data, parent, property, isIfExists) {
        Validator.call(this, data);
        this.parent = parent;
        this.property = property;
        this.and = parent;
        this.isIfExists = 'undefined' === typeof isIfExists ? false : !!isIfExists;
    }

    util.inherits(ValueValidator, Validator);

    ValueValidator.prototype.escape = function () {
        this.parent.data[this.property] = this._escape();
        return this;
    }

    ValueValidator.prototype.return = function () {
        return this.parent.return();
    }

    return ValueValidator;
})();