module.exports = (function () {
    var util = require('util');
    var validator = require('validator');
    var _ = require('underscore');

    /**
     *
     * @param data
     * @param isIfExists
     * @constructor
     */
    var BaseValidator = function (data, isIfExists) {
        this.data = data;
        this.isIfExists = 'undefined' === typeof isIfExists ? false : !!isIfExists;
    }

    BaseValidator.prototype._escape = function () {
        switch (typeof this.data) {
            case 'undefined':
                //throw "UNDEFINED";
                return false;
            case 'string':
                return validator.escape(this.data);
            case 'integer':
            case 'boolean':
                return this.data.toString();
            default :
                return JSON.stringify(this.data);
        }
    }

    BaseValidator.prototype.escape = function () {
        return this._escape();
    }

    BaseValidator.prototype.return = function () {
        return this.data;
    }

    /**
     * @private
     * @param data
     * @returns {boolean}
     */
    BaseValidator.prototype.isExists = function (data) {
        return !('undefined' === typeof data || data === '' || data === null || data.length === 0 || data === {});
    }

    /**
     * выдача сообщения об ошибке
     * @param msg
     */
    BaseValidator.prototype.riseError = function (msg) {
        if (!this.isExists(this.data) && this.isIfExists)return;
        throw msg;
    }

    /**
     * присвоение значения по умолчанию
     * @param data
     * @returns {exports}
     */
    BaseValidator.prototype.default = function (data) {
        if ('undefined' === typeof this.data) {
            this.data = data;
        }
        return this;
    }

    /**
     * проверка соответствия regexp
     * @param pattern:String or RegExp, modifiers, msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.matches = function (pattern, modifiers, msg) {
        msg = msg || 'NOT_MATCH';

        if (!validator.matches(this.data, pattern, modifiers)) {
            this.riseError(msg);
        }
        return this;
    }
    /**
     * проверка целых значений
     * @param msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.isInt = function (msg) {
        msg = msg || 'NOT_INTEGER';

        if (!validator.isInt(this.data)) {
            this.riseError(msg);
        }
        return this;
    }

    /**
     * проверка вещественных значений
     * @param msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.isFloat = function (msg) {
        msg = msg || 'NOT_FLOAT';

        if (!validator.isFloat(this.data)) {
            this.riseError(msg);
        }
        return this;
    }

    BaseValidator.prototype.isArray = function (msg) {
        msg = msg || 'NOT_ARRAY';

        if (!(this.data instanceof Array)) {
            this.riseError(msg);
        }
        return this;
    }

    /**
     * проверка email
     * @param msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.isEmail = function (msg) {
        if (this.data)
            this.data = this.data.toLocaleLowerCase().trim();

        msg = msg || 'NOT_EMAIL';

        if (!validator.isEmail(this.data)) {
            this.riseError(msg);
        }
        return this;
    }

    /**
     * проверка на вершнее значение
     * @param value
     * @param msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.isLess = function (value, msg) {
        msg = msg || 'NOT_LESS';

        if (this.data > value) {
            this.riseError(msg);
        }
        return this;
    }

    /**
     * проверка на нижнее значение
     * @param value
     * @param msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.isAbove = function (value, msg) {
        msg = msg || 'NOT_ABOVE';

        if (this.data < value) {
            this.riseError(msg);
        }
        return this;
    }

    BaseValidator.prototype.hasLength = function (min, max, msg) {
        if ('undefined' == typeof msg && 'string' === typeof max) {
            msg = max;
        }

        msg = msg || 'WRONG_LENGTH';

        var length = (function (data) {
            if ('undefined' === typeof data) {
                return 0;
            }

            if (data == null) {
                return 0;
            }

            if ('undefined' === typeof data.length) {
                return (data + '').length;
            }

            return data.length;
        })(this.data);

        if (length < min) {
            this.riseError(msg);
        }
        if ('undefined' !== typeof max && length > max) {
            this.riseError(msg);
        }
        return this;
    }

    /**
     * проверка на наличие
     * @param msg
     * @returns {exprorts}
     */
    BaseValidator.prototype.exists = function (msg) {
        msg = msg || 'REQUIRED';
        if (!this.isExists(this.data)) {
            this.riseError(msg);
        }
        return this;
    }

    return BaseValidator;
})
();
