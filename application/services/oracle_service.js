module.exports = OracleService;
var logger = require('../../innotrio_nodejs/logger/index').logger;

function OracleService() {

};

OracleService.prototype.connect = function (params, cb) {
    var self = this,
        oracledb = require('oracledb');
    oracledb.fetchAsString = [oracledb.DATE];
    oracledb.maxRows = 10000;
    oracledb.getConnection(
        params,
        function (err, connection) {
            if (err) {
                logger.log('DB_CONNECT_ERROR', err.message);
                return cb(err);
            }

            self.db = connection;
            self.db.execute('ALTER SESSION SET NLS_DATE_FORMAT = "YYYY-MM-DD HH24:MI:SS"', [], function () {
                console.log((new Date()).toString() + ' Oracle connected');
                cb(null,true);
            });
        });
};

/**
 * Выборка с пейджингом
 * @param query
 * @param params
 * @param done
 */
OracleService.prototype.getManyRows = function (query, params, done) {
    var cb = function (err, result) {
        if (err) {
            logger.log('DB_ORACLE_ERROR', query + '\n' + err.message, params);
            return done('DB_ORACLE_ERROR');
        }
        done(null, result.resultSet);
    };

    if (params !== null) {
        this.db.execute(query, params, { resultSet: true, prefetchRows: 500 }, cb);
    } else {
        this.db.execute(query, [], { resultSet: true, prefetchRows: 500 }, cb);
    }
};

/**
 * Потоковая выборка
 * @param query
 * @param params
 * @param done
 */
OracleService.prototype.queryStream = function (query, params) {
    params = params || [];
    return this.db.queryStream(query, params);
    // stream.on('error', function (error) {
    //     console.error('error: ', error);
    //     return;
    // });
    // stream.on('metadata', function (metadata) {
    //     console.log('metadata: ', metadata);
    // });
    // stream.on('data', function (data) {
    //     console.log('data: ', data);
    // });
    // stream.on('end', function () {
    //     console.log('end');
    //     done();
    // });
};

OracleService.prototype.fetchRows = function (resultSet, numRows, cb) {
    var self = this;
    resultSet.getRows(
        numRows,
        function (err, rows) {
            if (err) {
                logger.log('DB_ORACLE_FETCH_ERROR', err);
                self.closeResultSet(resultSet); // always close the result set
                cb(err);
            } else if (rows.length == 0) {    // no rows, or no more rows
                self.closeResultSet(resultSet); // always close the result set
                cb(null, []);
            } else if (rows.length > 0) {
                cb(null, rows);
            }
        });
};

OracleService.prototype.closeResultSet = function (resultSet, closeConnection) {
    closeConnection = closeConnection || false;
    var self = this;
    resultSet.close(function (err) {
        if (err)
            logger.log('DB_ORACLE_CLOSE_ERROR', err.message);
        if (closeConnection)
            self.closeConnection();
    });
};

OracleService.prototype.closeConnection = function () {
    this.db.release(function (err) {
        if (err)
            logger.log('DB_ORACLE_RELEASE_ERROR', err.message);
    });
};

OracleService.prototype.getRows = function (query, params, done) {
    var cb = function (err, result) {
        if (err) {
            logger.log('DB_ORACLE_ERROR', query + '\n' + err.message, params);
            return done('DB_ORACLE_ERROR');
        }
        done(null, result.rows);
    };

    if (params !== null) {
        this.db.execute(query, params, cb);
    } else {
        this.db.execute(query, cb);
    }
};

exports.OracleService = OracleService;