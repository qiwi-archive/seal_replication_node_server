module.exports = model.methods({
    replicate: function (params, done) {
        var params = Object.assign({}, params);
        var self = this;
        this._init(params, function (err, replication) {
            if (err != null)
                return done(err);
            //params.code заполняется в инициализации
            self._log(params, 'replication START');
            replication.replicate(function (err) {
                if (err) {
                    self._log(params, 'replication FAILED');
                } else {
                    self._log(params, 'replication DONE');
                }
                done(err);
            }, params.isForce);
        });
    },
    _log: function(params, logString) {
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
        var code = '';
        if (params.isMinutes) {
            code = 'ERRORS_MINUTES';
        } else {
            code = 'ERRORS_DAYS';
        }
        //Код устанавливается в параметры для передачи наружу
        params.code = code;

        var eventsFlowParams = {
            code: code,
            timeCode: params.isMinutes? 'M' : 'D',
            },
            daysInterval = params.days == 0 ? 10 : params.days,
            sqlMap = {
                partitionName: 'aggr_events_' + code.toLowerCase(),
                tableName: 'tmp_events_' + code.toLowerCase(),
                providerDbQuoted: '\'QW\'',
                idProviderTransform: '\'QW_\' || id_prv',
                flowCodeQuoted: '\'' + eventsFlowParams.code + '\'',
                timeCodeQuoted: '\'' + eventsFlowParams.timeCode + '\'',
                daysInterval: daysInterval,
                hoursInterval: daysInterval * 24,
                addZeros: 1,
                addSection: 1
            };

        parallel([
            function (done) {
                fs.readFile(__dirname + '/sql/events/drop_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/events/create_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                switch (code) {
                    case 'ERRORS_MINUTES':
                        fs.readFile(__dirname + '/sql/events/errors/five_minutes/vertica_select_no_action.sql', 'utf-8', done);
                        break;
                    case 'ERRORS_DAYS':
                        fs.readFile(__dirname + '/sql/events/errors/day/vertica_select_no_action.sql', 'utf-8', done);
                        break;
                }
            }, function (done) {
                fs.readFile(__dirname + '/sql/events/insert_temp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/events/create_flows.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/events/create_partitions.sql', 'utf-8', done);
            },function (done) {
                fs.readFile(__dirname + '/sql/events/update_temp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/events/create_providers.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/events/upsert_aggr_events.sql', 'utf-8', done);
            }, function (done) {
                switch (code) {
                    case 'ERRORS_MINUTES':
                        fs.readFile(__dirname + '/sql/events/insert_aggr_events_zeros_five_minutes.sql', 'utf-8', done);
                        break;
                    case 'ERRORS_DAYS':
                        fs.readFile(__dirname + '/sql/events/insert_aggr_events_zeros_days.sql', 'utf-8', done);
                        break;
                    default:
                        done(null, 'SELECT 1;');
                        return;
                }

            }
        ], function (error, results) {
            if (error)
                return done(error);

            var replicationParams = {
                sqlMap: sqlMap,
                replicationType: code,
                dropTmpTableSql: results[0],
                createTmpTableSql: results[1],
                externalDbSelectSql: results[2],
                pgInsertSql: results[3],
                pgCopySqls: results.slice(4),
                externalDb: 'vertica',
                externalDbConfigs: configs.vertica
            };
            var replication = new (require('../services/replication_service'))();

            replication.init(replicationParams, done);
        });
    }
});