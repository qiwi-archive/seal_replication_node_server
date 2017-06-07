module.exports = (function () {
    var _s = require('underscore.string');

    var Transformer = function (data) {
        if ((!data instanceof Object))throw Error('Data must be instance of Object');
        this.data = data;
    }

    Transformer.prototype.camelize = function () {
        var self=this;
        var transformedData = {};
        Object.keys(this.data).forEach(function (key) {
            transformedData[_s.camelize(key)] = self.data[key];
        });

        return transformedData;
    }

    Transformer.prototype.underscored = function () {
        var self=this;
        var transformedData = {};
        Object.keys(this.data).forEach(function (key) {
            transformedData[_s.underscored(key)] = self.data[key];
        });

        return transformedData;
    }

    return Transformer;
})();