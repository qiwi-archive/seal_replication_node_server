module.exports = (function () {
    var util = require('util');
    var _ = require('underscore');
    var BaseValidator = require('./base_validator');
    var ArrayValidator = require('./array_validator');
    var ObjectValidator = require('./object_validator');

    var Validator = function () {
        BaseValidator.apply(this, arguments);
    }

    util.inherits(Validator, BaseValidator);


    /**
     * метод апи, который добавляет условие существования перед проверкой
     * @returns {exports}
     */
    BaseValidator.prototype.ifExists = function () {
        return new Validator(this.data, true);
    }

    /**
     * проверка массива
     * @param msg
     * @returns {exprorts}
     */
    Validator.prototype.forArray = function (msg) {
        msg = msg || 'NOT_ARRAY';

        if (!(this.data instanceof Array)) {
            this.riseError(msg);
        }
        return new ArrayValidator(this.data, this);
    }

    Validator.prototype.isObject = function (msg) {
        msg = msg || 'NOT_OBJECT';

        if (!(_.isObject(this.data))) {
            this.riseError(msg);
        }
        return new ObjectValidator(this.data, this);
    }

    return Validator;
})();
