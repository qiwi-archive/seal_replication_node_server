module.exports = (function () {
    var util = require('util');
    var ExpressResponse = require('./express_response');
    var validator = require('../../../validator').validator;

    /**
     * Обертка для посредника, который может либо возвращеть ошибку, либо выполнять callback
     * @param request
     * @param response
     * @param middleware
     * @constructor
     */
    var ExpressRouteMiddleware = function (request, response, middleware, middlewareData) {
        if ('function' !== typeof middleware)throw 'Middleware must be a function';
        ExpressResponse.call(this, response);

        this.request = request;
        this.middleware = middleware;
        this.middlewareData = middlewareData;
    }

    util.inherits(ExpressRouteMiddleware, ExpressResponse);

    /**
     *
     * @param next callback в случае успеха
     */
    ExpressRouteMiddleware.prototype.pass = function (next, errorMiddleware) {
        var self = this;
        this.middleware.call(this, this.request, this.response, validator, function (error, data) {
            if (error)
                return self.sendError('string' === typeof error ? error : self.ERROR_MESSAGE, {query: self.request.query,
                    body: self.request.body,
                    params: self.request.params}, errorMiddleware);
            next(null, data);
        }, this.middlewareData);
    }

    return ExpressRouteMiddleware;

})();