module.exports = (function () {
    var util = require('util');
    var ArrayObjectValidator = require('./array_object_validator');
    var ObjectValidator = require('./object_validator');
    var Validator = require('./base_validator');
    var typeOf = require('type-of-is').string;
    var _s = require('underscore.string');

    var ArrayValidator = function (data, parent) {
        this.data = data;

        this.parent = parent;

        this.rules = {};

        this._ifExists = {};

        this.isIfExists = false;
    }

    ArrayValidator.prototype.ifExists = function () {
        this.isIfExists = true;
        return this;
    }

    ArrayValidator.prototype.matches = function () {
        this.rules['matches'] = arguments;
        return this;
    }

    ArrayValidator.prototype.isInt = function () {
        this.rules['isInt'] = arguments;
        return this;
    }

    ArrayValidator.prototype.isFloat = function () {
        this.addRule('isFloat', arguments);
        return this;
    }

    ArrayValidator.prototype.isAbove = function () {
        this.rules['isAbove'] = arguments;
        return this;
    }

    ArrayValidator.prototype.isLess = function () {
        this.rules['isLess'] = arguments;
        return this;
    }

    /**
     * @param camelize Если true, то у объектов в массиве поля менются с записи key_value на keyValue
     * @returns {ArrayObjectValidator}
     */
    ArrayValidator.prototype.isObject = function (camelize) {
        this.camelize = camelize || false;
        return new ArrayObjectValidator(this.data, this);
    }

    ArrayValidator.prototype.escape = function () {
        this.rules['escape'] = arguments;
        this.run();
        return this.data;
    }

    ArrayValidator.prototype.run = function () {
        var self = this;

        function traverse(data, i) {
            for (var ii in self.rules) {
                if (typeOf(self.rules[ii]) === 'Object') {
                    var validator = new ObjectValidator(data ? data[i] : data, self, self._ifExists[ii]);
                    for (var iii in self.rules[ii]) {
                        validator.prop(ii)[iii].apply(validator.prop(ii), self.rules[ii][iii]);
                    }
                } else if (!self.isIfExists) {
                    var validator = new Validator(data ? data[i] : data);
                    var result = validator[ii].apply(validator, self.rules[ii]);
                    if (ii === 'escape' && data)data[i] = result;
                }
            }
        }

        if (this.data.length > 0) {
            for (var i in this.data) {
                traverse(this.data, i);

                if (this.camelize) {
                    var item = this.data[i];
                    if (item)
                        Object.keys(item).forEach(function (key) {
                            var newKey;
                            if (item.hasOwnProperty(key)) {
                                newKey = _s.camelize(key)
                                item[newKey] = item[key];
                                delete item[key];
                            }
                        });
                }
            }
        } else {
            traverse(undefined);
        }
        return this.parent;
    }

    ArrayValidator.prototype.return = function () {
        this.run();
        return this.parent.return();
    }

    return ArrayValidator;
})();