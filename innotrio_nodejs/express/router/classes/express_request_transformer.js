module.exports = (function () {
    var util = require('util');
    var _ = require('underscore');
    var Transformer = require('../.././classes/transformer');

    var ExpressRequestTransformer = function (request) {
        var data = {};
        _.extend(data, request.query);
        _.extend(data, request.params);

        if (request.body instanceof Object && !util.isArray(request.body)) {
            _.extend(data, request.body);
        } else {
            data.body = request.body;
        }

        Transformer.call(this, data);
    }

    util.inherits(ExpressRequestTransformer, Transformer);

    ExpressRequestTransformer.prototype.transform = function () {
        return this.camelize();
    }

    return ExpressRequestTransformer;
})();