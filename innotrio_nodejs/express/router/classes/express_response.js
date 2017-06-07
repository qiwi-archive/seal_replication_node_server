module.exports = (function () {
    var logger = require('../../../logger').logger;

    /**
     * Обертка для ответа
     * @param response express.res
     * @constructor
     */
    var ExpressResponse = function (response) {
        this.response = response;
    }

    /**
     * отправляем любые данные
     * @param data
     */
    ExpressResponse.prototype.send = function (data) {
        /*if (process.env.NODE_ENV === 'development') {
            logger.log('DEBUG_SEND_ALL','',data);
        }*/
        this.response.json(200, data);
    }

    /**
     * формат ответа
     * @param data
     * @returns {{status: string, result: data}}
     */
    ExpressResponse.prototype.getSuccessFormat = function (data) {
        return {
            status: 'done',
            result: data
        };
    }

    /**
     * формат ошибки
     * @param message
     * @returns {{status: string, message: *}}
     */
    ExpressResponse.prototype.getErrorFormat = function (message) {
        return {
            status: 'error',
            message: message
        };
    }

    /**
     * отправить данные
     * @param data
     */
    ExpressResponse.prototype.sendSuccess = function (data) {
        this.send(this.getSuccessFormat(data));
    }

    /**
     * отправить ошибку
     * @param message
     * @param error
     */
    ExpressResponse.prototype.sendError = function (message, error, errorMiddleware) {
        logger.log(message,'',error);
        var self = this;
        if('function' === typeof (errorMiddleware)) {
            errorMiddleware(message, function (error, result) {
                self.send(result);
            });
        } else {
            this.send(this.getErrorFormat(message));
        }
    }

    return ExpressResponse;
})();