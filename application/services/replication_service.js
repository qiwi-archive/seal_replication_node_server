module.exports = ReplicationService;

var pg = require('pg');
var copyFrom = require('pg-copy-streams').from;

function ReplicationService() {

}

/**
 * Ассоциативный массив мьютексов репликации, где ключ - тип репликации.
 * @type {Array}
 */
ReplicationService.mutexByType = [];

ReplicationService.prototype.log = function (logString) {
    var result = (new Date()).toString();
    result += ' : ' + this.replicationType;
    result += ' : ' + logString;
    console.log(result);
};

ReplicationService.prototype.init = function (params, cb) {
    var self = this;
    self.params = params;
    //Производит замены в sql вида {{key}} -> value, взятые из sqlMap.
    var sqlMap = params.sqlMap || {};
    var replaceMapAsync = function (string, done) {
        var result = {
            string: string
        };
        forEachOf(sqlMap, function (value, key, cb) {
            result.string = result.string.replace(new RegExp('{{' + key + '}}', 'g'), sqlMap[key]);
            cb();
        }, function (err) {
            done(err, result.string);
        });
    };

    this.replicationType = params.replicationType;
    this.payFlowParams = params.payFlowParams;
    //Update, Insert и т.п. из временной таблицы
    params.pgCopySqls = params.pgCopySqls || [];
    this.pgCopySqls = [];

    parallel([
        function (done) {
            replaceMapAsync(params.dropTmpTableSql, done);
        }, function (done) {
            replaceMapAsync(params.createTmpTableSql, done);
        }, function (done) {
            replaceMapAsync(params.externalDbSelectSql, done);
        }, function (done) {
            replaceMapAsync(params.pgInsertSql, done);
        }, function (done) {
            each(params.pgCopySqls, function (sql, cb) {
                replaceMapAsync(sql, function (err, result) {
                    if (err) {
                        cb(err);
                    } else {
                        self.pgCopySqls.push(result);
                        cb();
                    }
                });
            }, function (err) {
                done(err);
            });
        }
    ], function (err, results) {
        if (err) {
            cb(err);
        } else {
            self.dropTmpTableSql = results[0];
            self.createTmpTableSql = results[1];
            self.externalDbSelectSql = results[2];
            self.pgInsertSql = results[3];

            self.externalDb = new (require('./' + params.externalDb + '_service'))();
            self.externalDb.connect(params.externalDbConfigs, function (err, result) {
                if (err != null)
                    return cb(err);
                cb(null, self);
            });
        }
    });

};

/**
 * Проверка захвата мьютекса для текущего типа репликации
 * @returns {boolean}
 */
ReplicationService.prototype.isMutexCaptured = function () {
    return ReplicationService.mutexByType[this.replicationType] === this;
};

/**
 * Освобождение мьютекса для текущего типа репликации
 */
ReplicationService.prototype.freeMutex = function () {
    ReplicationService.mutexByType[this.replicationType] = null;
};

/**
 * Попытка захвата мьютекса для текущего типа репликации
 * @param isForce Принудительный захват
 * @returns {boolean}
 */
ReplicationService.prototype.captureMutex = function (isForce) {
    //Попытка захвата мьютекса
    ReplicationService.mutexByType[this.replicationType] = ReplicationService.mutexByType[this.replicationType] || this;

    if (!this.isMutexCaptured()) {
        if (isForce) {
            console.log('FORCED_REPLICATION');
            ReplicationService.mutexByType[this.replicationType] = this;
        } else {
            return false;
        }
    }
    return true;
};


ReplicationService.prototype.replicate = function (done, isForce) {
    if (!this.captureMutex(isForce)) {
        this.externalDb.closeConnection();
        return done('ANOTHER_REPLICATION_IS_IN_PROGRESS');
    }

    var self = this;
    waterfall([
        function (next) {
            self.log('replication _getOList');
            self._getOList(next);
        }, function (data, next) {
            if (!self.isMutexCaptured())
                return done('REPLICATION_FORCE_STOPPED');

            self.log('replication _createPgTempTable');
            self._createPgTempTable(function (err) {
                if (err != null)
                    return next(err);
                next(null, data);
            });
        }, function (data, next) {
            if (!self.isMutexCaptured())
                return done('REPLICATION_FORCE_STOPPED');

            self.log('replication _fetchOList');
            self._fetchOList(data, next);
        }, function (data, next) {
            if (!self.isMutexCaptured())
                return done('REPLICATION_FORCE_STOPPED');
            next = next || data;
            self.log('replication _pgCopySqls');
            if (self.pgCopySqls.length > 0) {
                each(self.pgCopySqls, function (item, cb) {
                    self._runPgCopySql(item, function (err, result) {
                        if (err) {
                            cb(err);
                        } else {
                            console.log(item.substring(0, 30) + new Date().toString() + ' ok');
                            cb();
                        }
                    });
                }, next);
            } else {
                next();
            }
        }, function (next, data) {
            if (!self.isMutexCaptured())
                return done('REPLICATION_FORCE_STOPPED');

            next = next || data;
            self.log('replication final _dropPgTempTable');
            self._dropPgTempTable(next);
        }
    ], function (err, result) {
        self.externalDb.closeConnection();
        self.freeMutex();

        done(err, result);
    });
};

ReplicationService.prototype._dropPgTempTable = function (done) {
    services.db.run(this.dropTmpTableSql, null, done);
};

ReplicationService.prototype._createPgTempTable = function (done) {
    services.db.run(this.createTmpTableSql, null, done);
};

ReplicationService.prototype._getOList = function (done) {
    this.externalDb.getManyRows(this.externalDbSelectSql, null, done);
};

ReplicationService.prototype._getInputStream = function (done) {
    return this.externalDb.queryStream(this.externalDbSelectSql);
};

ReplicationService.prototype._fetchInputStream = function (inputStream, done) {
    var self = this;
    var outStream = services.db.client.query(copyFrom(self.pgInsertSql));
    outStream.on('error', done);
    outStream.on('end', function () {
        self.log('ExternalDB to InternalDB Streaming done');
        client.end(done);
    });
    inputStream.on('end', function () {
        outStream.end();
    });
    inputStream.on('data', function (data) {
        outStream.write(data.join(',') + '\r\n');
    });
};

ReplicationService.prototype._fetchOList = function (itemsResultSet, done) {
    var self = this;
    this.externalDb.fetchRows(itemsResultSet, 10000, function (err, items) {
        if (err)
            return done(err);

        if (items.length == 0)
            return done();

        self._copyPgSlice(items, function (err) {
            if (!self.isMutexCaptured())
                err = err || 'REPLICATION_FORCE_STOPPED';

            if (err) {
                self.externalDb.closeResultSet(itemsResultSet, true);
                return done(err);
            }

            self._fetchOList(itemsResultSet, done);
        })
    });
};

ReplicationService.prototype._insertPgList = function (items, done) {
    var self = this;
    if (items.length > 0) {
        var startIndex = 0,
            slice,
            count = 100;
        async.whilst(
            function () {
                return startIndex <= items.length;
            },
            function (cb) {
                slice = items.slice(startIndex, startIndex + count);
                startIndex += count;
                self._copyPgSlice(slice, cb);
            }, done
        );
    } else {
        done();
    }
};

ReplicationService.prototype._insertPgSlice = function (items, done) {
    var sqlValues = [],
        params = [], num = 1,
        self = this;
    each(items, function (item, cb) {
            var res = [];
            for (var i = 0; i < item.length; i++) {
                res.push('$' + num);
                params.push(item[i]);
                num++;
            }
            sqlValues.push('(' + res.join(',') + ')');
            cb();
        }, function () {
            if (sqlValues.length == 0)
                return done();
            services.db.run(self.pgInsertSql + sqlValues.join(','), params, function (err, result) {
                if (err) {
                    return done();
                }
                done();
            });
        }
    );
};

ReplicationService.prototype._copyPgSlice = function (items, done) {
    var sqlValues = '';
    var self = this;
    var outStream = services.db.client.query(copyFrom(self.pgInsertSql));
    outStream.on('error', done);
    outStream.on('end', done);
    each(items, function (item, cb) {
            var newLine = true;
            each(item, function (value, cb) {
                if (!newLine) {
                    sqlValues += ','
                }
                newLine = false;
                if (value != null) {
                    sqlValues += "\x1f" + value + "\x1f";
                }
                cb();
            }, function () {
                sqlValues += "\r\n";
                cb();
            });
        }, function () {
            outStream.write(sqlValues);
            outStream.end();
        }
    );
};

ReplicationService.prototype._runPgCopySql = function (sql, done) {
    services.db.run(sql, null, done);
};

exports.ReplicationService = ReplicationService;