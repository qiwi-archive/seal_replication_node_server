module.exports = VerticaService;
var logger = require('../../innotrio_nodejs/logger/index').logger;
var Stream = require('stream');

function VerticaService() {

};

VerticaService.prototype.connect = function (params, cb) {
    var self = this,
        vertica = require('vertica');
    vertica.connect(
        params,
        function (err, connection) {
            if (err) {
                logger.log('DB_CONNECT_ERROR', err.message);
                return cb(err);
            }

            self.db = connection;
            console.log((new Date()).toString() + ' VERTICA connected');
            cb(null,true);
        });
};


/**
 * Потоковая выборка
 * @param query
 * @param params
 * @param done
 */
VerticaService.prototype.queryStream = function (query, params) {
    params = params || [];
    var stream = new Stream;
    stream.readable = true;
    var query = this.db.query(query, params);
    query.on('row', function(row) {
        stream.emit('data', row);
    });
    query.on('end', function(status) {
        stream.emit('end');
    });
    query.on('error', function(err) {
        stream.emit('error', err);
    });
    return stream;
};

/**
 * Выборка с пейджингом
 * @param query
 * @param params
 * @param done
 */
VerticaService.prototype.getManyRows = function (query, params, done) {
    params = params || [];
    this.getRows(query, params, done);
};

VerticaService.prototype.fetchRows = function (resultSet, numRows, cb) {
    cb(null, resultSet.splice(0, numRows));
};

VerticaService.prototype.closeResultSet = function (resultSet, closeConnection) {
    closeConnection = closeConnection || false;
    resultSet.length = 0;
    delete resultSet;
    if (closeConnection) {
        this.closeConnection();
    }
};

VerticaService.prototype.closeConnection = function () {
    this.db.disconnect();
};

VerticaService.prototype.getRows = function (query, params, done) {
    params = params || [];
    var cb = function (err, result) {
        if (err) {
            logger.log('DB_VERTICA_ERROR', query + '\n' + err.message, params);
            return done('DB_VERTICA_ERROR');
        }
        done(null, result.rows);
    };
    this.db.query(query, params, cb);
};

exports.VerticaService = VerticaService;