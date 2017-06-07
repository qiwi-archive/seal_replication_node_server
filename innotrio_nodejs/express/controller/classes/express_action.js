module.exports = (function () {
    var allowedMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    /**
     * Обертка для action.
     * @param options
     * @constructor
     */
    var ExpressAction = function (options) {
        if (options.method !== undefined && !~allowedMethods.indexOf(options.method))throw 'Unknown action\'s method';
        if ('function' !== typeof options.route)throw 'Action\'s route must be a function';
        if ('function' !== typeof options.validate)throw 'Action\'s validate must be a function';
        if ('string' !== typeof options.url) throw 'Actions\'s url must be a string';

        this.name = options.name;
        this.url = options.url;
        this.method = options.method || 'GET';
        this.route = options.route;
        this.validate = options.validate;
        this.isPrivate = !!options.isPrivate || false;
        this.middlewareData = options.middlewareData || {};
    }

    return ExpressAction;

})();