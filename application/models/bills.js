module.exports = model.methods({
    replicate: function (params, done) {
        var params = Object.assign({}, params);
        var self = this;
        this._init(params, function (err) {
            if (err != null) {
                self._log(params, 'replication FAILED');
                return done(err);
            }
            self._log(params, 'replication DONE');
            done(err);
        });
    },
    _log: function (params, logString) {
        if (params.skipLog === true) {
            return;
        }
        var result = (new Date()).toString();
        result += ' : ' + params.code;
        result += ' : ' + params.days + '_DAYS';
        if (params.isForce) {
            result += ' !IS_FORCE!';
        }
        result += ' : ' + logString;
        console.log(result);
    },
    _init: function (params, done) {
        var self = this;

        var code = '';
        if (params.isMinutes) {
            code = 'QW_MINUTES';
        } else {
            code = 'QW_DAYS';
        }

        if (params.replicateExtras === true || params.replicateExtras === 1) {
            code += '_EXTRAS';
        }

        if (params.moreThan15k) {
            code += '_15KPLUS';
        }
        if (params.equals15k) {
            code += '_15K';
        }

        //Код устанавливается в параметры для передачи наружу
        params.code = code;

        var payFlowParams = {
                code: code,
                timeCode: params.isMinutes ? 'M' : 'D',
                add_zeros: (code == 'QW_DAYS' || code == 'QW_MINUTES') ? 1 : 0
            },
            daysInterval = params.days == 0 ? ( params.isMinutes ? 5 : 10) : params.days;


        parallel([
            function (done) {
                fs.readFile(__dirname + '/sql/transactions/drop_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/create_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                switch (code) {
                    case 'QW_MINUTES':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/five_minutes/oracle_select_qw_no_extras.sql', 'utf-8', done);
                        break;
                    case 'QW_DAYS':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/day/oracle_select_no_extras.sql', 'utf-8', done);
                        break;
                    case 'QW_MINUTES_EXTRAS':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/five_minutes/oracle_select_qw_with_extras.sql', 'utf-8', done);
                        break;
                    case 'QW_DAYS_EXTRAS':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/day/oracle_select_with_extras.sql', 'utf-8', done);
                        break;
                    case 'QW_DAYS_EXTRAS_15K':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/day/oracle_select_15k_with_extras.sql', 'utf-8', done);
                        break;
                    case 'QW_DAYS_EXTRAS_15KPLUS':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/day/oracle_select_15kplus_with_extras.sql', 'utf-8', done);
                        break;
                }
            }, function (done) {
                switch (code) {
                    case 'QW_MINUTES_EXTRAS':
                    case 'QW_DAYS_EXTRAS':
                    case 'QW_DAYS_EXTRAS_15KPLUS':
                    case 'QW_DAYS_EXTRAS_15K':
                        fs.readFile(__dirname + '/sql/transactions/qw/pull/insert_temp_table_with_extras.sql', 'utf-8', done);
                        break;
                    default:
                        fs.readFile(__dirname + '/sql/transactions/insert_temp_table.sql', 'utf-8', done);
                        break;
                }
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/create_flows.sql', 'utf-8', done);
            }, function (done) {
                switch (code) {
                    case 'QW_MINUTES_EXTRAS':
                    case 'QW_MINUTES':
                        if (daysInterval < 1) {
                            done(null, 'SELECT 1;');
                            break;
                        }
                    default:
                        fs.readFile(__dirname + '/sql/transactions/create_partitions.sql', 'utf-8', done);
                        break;
                }
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/update_temp_table.sql', 'utf-8', done);
            }, function (done) {
                switch (code) {
                    case 'QW_MINUTES_EXTRAS':
                    case 'QW_MINUTES':
                        done(null, 'SELECT 1;');
                        break;
                    default:
                        fs.readFile(__dirname + '/sql/transactions/create_providers.sql', 'utf-8', done);
                        break;
                }
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/upsert_aggr_bills.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/upsert_aggr_bills_tags.sql', 'utf-8', done);
            }, function (done) {
                switch (code) {
                    case 'QW_MINUTES':
                        fs.readFile(__dirname + '/sql/transactions/insert_aggr_bills_zeros_five_minutes.sql', 'utf-8', done);
                        break;
                    case 'QW_DAYS':
                        fs.readFile(__dirname + '/sql/transactions/insert_aggr_bills_zeros_days.sql', 'utf-8', done);
                        break;
                    default:
                        done(null, 'SELECT 1;');
                        return;
                }
            }
        ], function (error, results) {
            if (error)
                return done(error);

            var sqlMap = {
                replicationTypeQuoted: '\'' + code + '\'',
                partitionName: 'aggr_bills_' + code.toLowerCase(),
                tableName: 'tmp_bills_' + code.toLowerCase(),
                providerDbQuoted: '\'QW\'',
                idProviderTransform: '\'QW_\' || id_prv',
                flowCodeQuoted: '\'' + payFlowParams.code + '\'',
                timeCodeQuoted: '\'' + payFlowParams.timeCode + '\'',
                addSection: 1,
                currency: 643,
                addZeros: payFlowParams.add_zeros ? 'CASE WHEN pflow_currency IN (643, 840, 978) THEN 1 ELSE 0 END' : '0',
                daysInterval: daysInterval,
                hoursInterval: daysInterval * 24
            };

            var replicationParams = {
                sqlMap: sqlMap,
                replicationType: code,
                dropTmpTableSql: results[0],
                createTmpTableSql: results[1],
                externalDbSelectSql: results[2],
                pgInsertSql: results[3],
                pgCopySqls: results.slice(4),
                externalDb: 'oracle',
                externalDbConfigs: configs.oracleQwStat
            };

            var ReplicationService = require('../services/replication_service');

            switch (code) {
                case 'QW_MINUTES':
                case 'QW_MINUTES_EXTRAS':
                    var qwReplicationParams = JSON.parse(JSON.stringify(replicationParams));
                    qwReplicationParams.pgCopySqls.pop(); // убираем забивание нулями
                    qwReplicationParams.externalDbConfigs = configs.oracleQw;
                    var replicationQW = new ReplicationService();
                    self._log(params, 'replication START');
                    replicationQW.init(qwReplicationParams, function (err) {
                        if (err) {
                            return done(err);
                        }
                        replicationQW.replicate(done, params.isForce);
                    });
                    break;
                default:
                    var replication = new ReplicationService();
                    self._log(params, 'replication START');
                    replication.init(replicationParams, function (err) {
                        if (err) {
                            return done(err);
                        }
                        replication.replicate(done, params.isForce);
                    });
                    break;
            }
        });
    }
});