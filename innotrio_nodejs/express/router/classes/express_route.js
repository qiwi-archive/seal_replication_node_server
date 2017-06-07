module.exports = (function () {
    var util = require('util');
    var ExpressResponse = require('./express_response');
    var ExpressAction = require('../../controller/classes/express_action');
    var validator = require('../../../validator').validator;
    var logger = require('../../../logger').logger;

    var FATAL_ERROR = 'SOMETHING_IS_WRONG';
    /**
     * Обработчик запроса
     * @param request express.req
     * @param response express.res
     * @param action см. express_action
     * @constructor
     */
    var ExpressRoute = function (request, response, action) {
        if (!(action instanceof ExpressAction))throw 'Action must be instance of ExpressAction';
        ExpressResponse.call(this, response);

        this.request = request;
        this.action = action;

        this.ERROR_PREFIX = action.name.toUpperCase();

        this.FATAL_ERROR = this.getErrorCode(FATAL_ERROR);
    }

    util.inherits(ExpressRoute, ExpressResponse);

    /**
     * Обрабатывает запрос
     * @param errorHandler
     */
    ExpressRoute.prototype.route = function (errorMiddleware) {
        var self = this;
        try {
            var data = this.action.validate(this.request, validator);
        } catch (error) {
            if ('string' === typeof error)return self.sendStandardError(error, errorMiddleware);
            return self.sendFatalError(error, errorMiddleware);
        }
        self.action.route(self.request, data, function (error, data) {
            if (error) {
                if ('string' === typeof error)return self.sendStandardError(error, errorMiddleware);
                return self.sendFatalError(error, errorMiddleware);
            }
            self.sendSuccess(data);
        }, this.response);
    }

    /**
     * обработка неизвестной ошибки
     * @param error
     */
    ExpressRoute.prototype.sendFatalError = function (error, errorMiddleware) {
        console.log(error);
        console.log(error.stack)
        logger.log(this.FATAL_ERROR, 'REQUEST',
            {query: this.request.query,
                body: this.request.body,
                params: this.request.params});
        this.sendError(this.FATAL_ERROR, error, errorMiddleware);
    }

    /**
     * Высылаем стандартную, предсказуемую нами ошибку
     * @param code
     * @returns {string}
     */
    ExpressRoute.prototype.sendStandardError = function (error, errorMiddleware) {
        var request = this.request || {};
        return this.sendError(this.getErrorCode(error), {query: this.request.query,
            body: this.request.body,
            params: this.request.params}, errorMiddleware);
    }

    /**
     * Прибаляет к стандартному коду ошибки уникальный префикс-идентификатор
     * @param code
     * @returns {string}
     */
    ExpressRoute.prototype.getErrorCode = function (code) {
        return [this.ERROR_PREFIX, code].join('__');
    }

    return ExpressRoute;
})();