module.exports = (function () {
    var ExpressController = require('./classes/express_controller');

    return {
        controller: function (url) {
            return new ExpressController(url);
        }
    };
})();