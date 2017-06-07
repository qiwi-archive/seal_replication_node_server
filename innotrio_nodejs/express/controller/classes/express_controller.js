module.exports = (function () {
    var Action = require('./express_action');

    /**
     * Контроллер отвечает за обработку запроса, маршрут которого складывается из controller.url/action.url
     * @param url
     * @constructor
     */
    var ExpressController = function (name) {
        this.name = name;
        this.url = '/' + name;
        this.actions = [];
    }

    /**
     * Создание action
     * @param method HTTP methods: GET,POST,DELETE,PUT ...
     * @param url
     * @param validate метод валидации function(req,validator,next){}
     * @param route основаная логика обработки запроса function(req,data,done){}, где data - данные, которые возвращаются методом validate
     * @param isPrivate требуется ли предварительная авторизация
     * @param middlewareData то, что может потребоваться в middleware. К примеру, опциональная проверка прав
     * @returns {exports}
     */
    ExpressController.prototype.action = function (method, name, validate, route, isPrivate, middlewareData) {
        this.actions.push(new Action({
            name: [this.name, name].join('_'),
            method: method,
            url: [this.url, name].join('/'),
            validate: validate,
            route: route,
            isPrivate: isPrivate,
            middlewareData: middlewareData
        }));
        return this;
    }

    /**
     * Добавление action для метода POST
     * @param url
     * @param validate
     * @param route
     * @param isPrivate
     * @returns {*}
     */
    ExpressController.prototype.actionPost = function (url, validate, route, isPrivate, middlewareData) {
        return this.action('POST', url, validate, route, isPrivate, middlewareData);
    }

    /**
     * Добавление action для метода GET
     * @param url
     * @param validate
     * @param route
     * @param isPrivate
     * @returns {*}
     */
    ExpressController.prototype.actionGet = function (url, validate, route, isPrivate, middlewareData) {
        return this.action('GET', url, validate, route, isPrivate, middlewareData);
    }

    /**
     *
     * @param url
     * @param validate
     * @param route
     * @param isPrivate
     * @returns {exports}
     */
    ExpressController.prototype.actionPut = function (url, validate, route, isPrivate, middlewareData) {
        return this.action('PUT', url, validate, route, isPrivate, middlewareData);
    }

    /**
     *
     * @param url
     * @param validate
     * @param route
     * @param isPrivate
     * @returns {exports}
     */
    ExpressController.prototype.actionDelete = function (url, validate, route, isPrivate, middlewareData) {
        return this.action('DELETE', url, validate, route, isPrivate, middlewareData);
    }

    /**
     * Выдать все action контроллера
     * @returns {Array}
     */
    ExpressController.prototype.getActions = function () {
        return this.actions;
    }

    return ExpressController;

})();