module.exports = (function () {
    var fs = require('fs');
    var path = require('path');
    var _ = require('underscore');
    var utils = require('../../../utils');
    var Route = require('./express_route');
    var RouteMiddleware = require('./express_route_middleware');


    /**
     * Выполняет автоматический роутинг запросов
     * @param expressApp
     * @param configs
     * configs.authMiddleware посредник для выполнения авторизации
     * configs.controllerPath путь к папке с контроллерами относительно корня
     * @constructor
     */
    var ExpressRouter = function (expressApp, configs) {
        this.expressApp = expressApp;
        this.expressApp.use(expressApp.router);

        configs = configs || {};

        this.configs = {
            controllersPath: configs.controllersPath || 'controllers',
            authMiddleware: configs.authMiddleware || this.getDummyMiddleware(),
            root: configs.root || '',
            errorMiddleware: configs.errorMiddleware
        };

        this.controllers = utils.readDir(this.configs.controllersPath);
    }

    /**
     * Инициализирует все контроллеры
     */
    ExpressRouter.prototype.route = function () {
        var self = this;
        _.each(this.controllers, function (controller) {
            self.routeController(controller);
        });
    }

    /**
     * Роутинг контроллера
     * @param controller
     */
    ExpressRouter.prototype.routeController = function (controller) {
        var self = this;
        _.each(controller.getActions(), function (action) {
            self.routeAction(action);
        });
    }

    /**
     * Роутинг action
     * @param action
     */
    ExpressRouter.prototype.routeAction = function (action) {
        this.expressApp[action.method.toLowerCase()](this.configs.root + action.url, this.getRouteMiddleware(action.isPrivate ? this.configs.authMiddleware : this.getDummyMiddleware(), action.middlewareData, this.configs.errorMiddleware), this.getActionRoute(action, this.configs.errorMiddleware));
    }

    /**
     * Оборачивает функцию в RouteMiddleware
     * @param middleware
     * @param middlewareData
     * @returns {Function}
     */
    ExpressRouter.prototype.getRouteMiddleware = function (middleware, middlewareData, errorMiddleware) {
        return function (req, res, next) {
            new RouteMiddleware(req, res, middleware, middlewareData).pass(next, errorMiddleware);
        }
    }

    /**
     * оборачивает action в route
     * @param action
     * @returns {Function}
     */
    ExpressRouter.prototype.getActionRoute = function (action, errorMiddleware) {
        return function (req, res) {
            new Route(req, res, action).route(errorMiddleware);
        }
    }

    /**
     * возвращает пустой middleware
     * @returns {Function}
     */
    ExpressRouter.prototype.getDummyMiddleware = function () {
        return function (req, res, validator, next, middlewareData) {
            next();
        };
    }

    return ExpressRouter;

})();

