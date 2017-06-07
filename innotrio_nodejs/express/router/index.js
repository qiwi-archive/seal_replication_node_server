module.exports = (function () {
    var ExpressRouter = require('./classes/express_router');

    return {
        router: function (expressApp, configs) {
            return new ExpressRouter(expressApp, configs);
        }
    };
})();

