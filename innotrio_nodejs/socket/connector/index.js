module.exports = (function () {
    var SocketConnector = require('./classes/socket_connector');
    return{
        connector: function (url, settings) {
            return new SocketConnector(url, settings);
        }
    };
})();