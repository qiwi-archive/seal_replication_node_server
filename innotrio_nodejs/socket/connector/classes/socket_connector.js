module.exports = (function () {

    var io = require('socket.io-client');
    var url = require('url');

    var DEFAULT_RECONNECTION_DELAY = 5000;

    var SocketConnector = function (url, settings) {
        if (SocketConnector.prototype._singletonInstances && SocketConnector.prototype._singletonInstances[url]) {
            return SocketConnector.prototype._singletonInstances[url];
        }
        SocketConnector.prototype._singletonInstances || (SocketConnector.prototype._singletonInstances = {});
        SocketConnector.prototype._singletonInstances[url] = this;

        this.url = url;

        settings = settings || {};

        this.settings = {
            reconnectionDelay: settings.reconnectionDelay || DEFAULT_RECONNECTION_DELAY
        };

        this.isConnected = false;
        this.isConnecting = false;
        this.socket = null;
        this._requestsBuffer = [];

    };

    SocketConnector.prototype._onConnect = function () {
        this.isConnected = true;
        this.isConnecting = false;
        this._processBuffer();
    }

    SocketConnector.prototype.connect = function (done) {

        var self = this
            , options = {
                'reconnection delay': this.settings.reconnectionDelay,
                'max reconnection attempts': Infinity
            };

        if (this.isConnected || this.isConnecting) {
            if (done && typeof done == 'function') done();
            return;
        }

        this.isConnecting = true;

        this.socket = io.connect(this.url, options);

        this.socket.on('connecting', function () {
            console.log('Trying connect to ' + self.url);
        });
        this.socket.on('connect_failed', function () {
            console.log('Reconnection with ' + self.url + ' failed');
        });
        this.socket.on('connect', function () {
            console.log('Connection with ' + self.url + ' established');
            self._onConnect();
            if (done && typeof done == 'function') done();
        });
        this.socket.on('reconnecting', function () {
            console.log('Trying reconnect to ' + self.url);
        });
        this.socket.on('reconnect_failed', function () {
            console.log('Reconnection with ' + self.url + ' failed');
        });
        this.socket.on('reconnect', function () {
            console.log('Connection with ' + self.url + ' established after reconnection');
        });
        this.socket.on('disconnect', function () {
            console.log('Disconnected from ' + self.url);
            self.isConnected = false;
        });
        this.socket.on('error', function () {
            console.log('Error occurs on connection with ' + self.url);
            if (!this.socket.connected)this.socket.reconnect();

        });

        return this;
    }

    SocketConnector.prototype.emit = function (code, data, done) {
        if (this.isConnected) {
            if (done === undefined) {
                try {
                    this.socket.emit(code, data);
                } catch (ex) {
                    console.log('SOCKET_CONNECTOR_ERROR, %j', ex);
                }
            } else {
                try {
                    this.socket.emit(code, data, done);
                } catch (ex) {
                    done('SOCKET_CONNECTOR_ERROR');
                }
            }
        } else {
            this._requestsBuffer.push([code, data, done]);
        }
    };

    SocketConnector.prototype._processBuffer = function () {
        for (var i = 0, length = this._requestsBuffer.length; i < length; i++) {
            this.emit.apply(this, this._requestsBuffer[i]);
        }
        this._requestsBuffer = [];
    }

    return SocketConnector;
})();

