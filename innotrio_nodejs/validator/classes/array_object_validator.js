module.exports = (function () {
    var ArrayValueValidator = require('./array_value_validator');
    var _ = require('underscore');

    var ArrayObjectValidator = function (data, parent, msg, isIfExists) {
        msg = msg || 'NOT_OBJECT'

        this._data = data;

        this._parent = parent;

        this.isIfExists = 'undefined' === typeof isIfExists ? false : !!isIfExists;

        this._data.forEach(function (value) {
            if (!_.isObject(value))throw msg;
        });

    }

    ArrayObjectValidator.prototype.ifExists = function () {
        this.isIfExists = true;
        return this;
    }

    ArrayObjectValidator.prototype.prop = function (key) {
        return new ArrayValueValidator(key, this, this.isIfExists);
    }

    ArrayObjectValidator.prototype.escape = function () {
        return this._parent;
    }

    ArrayObjectValidator.prototype.return = function () {
        return this._parent.return();
    }

    return ArrayObjectValidator;
})();