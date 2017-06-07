module.exports = (function () {
    var ValueValidator = require('./value_validator');

    var ObjectValidator = function (data, parent, isIfExists) {
        this.data = data||{};

        this.parent = parent;

        this.isIfExists = 'undefined' === typeof isIfExists ? false : !!isIfExists;
    }

    ObjectValidator.prototype._ifExists = function () {
        this.isIfExists = true;
        return this;
    }

    ObjectValidator.prototype.prop = function (key) {
        return new ValueValidator(this.data[key], this, key, this.isIfExists);
    }

    ObjectValidator.prototype.return = function () {
        return this.data;
    }

    ObjectValidator.prototype.escape = function () {
        return this.parent.escape();
    }

    ObjectValidator.prototype.return = function () {
        return this.parent.return();
    }

    return ObjectValidator;
})();