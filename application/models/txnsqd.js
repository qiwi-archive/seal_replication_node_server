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
        var code = 'QD_SOX';

        //Код устанавливается в параметры для передачи наружу
        params.code = code;

        var payFlowParams = {
                code: code,
                timeCode: 'D',
                //source: '',
                add_zeros: 1
            },
            daysInterval = params.days == 0 ? 10 : params.days,
            sqlMap = {
                replicationTypeQuoted: '\'' + code + '\'',
                partitionName: 'aggr_bills_' + code.toLowerCase(),
                tableName: 'tmp_bills_' + code.toLowerCase(),
                providerDbQuoted: '\'QD\'',
                idProviderTransform: '\'QD_\' || id_prv',
                flowCodeQuoted: '\'' + code + '\'',
                timeCodeQuoted: '\'' + payFlowParams.timeCode + '\'',
                addSection: 1,
                addZeros: payFlowParams.add_zeros,
                currency: 643,
                paySeconds: 0,
                daysInterval: daysInterval,
                hoursInterval: daysInterval * 24
            };

        parallel([
            function (done) {
                fs.readFile(__dirname + '/sql/transactions/drop_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/create_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/qd/oracle_select.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/insert_temp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/create_flows.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/create_partitions.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/update_temp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/create_providers.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/upsert_aggr_bills.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/transactions/insert_aggr_bills_zeros_days.sql', 'utf-8', done);
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
                externalDb: 'oracle',
                externalDbConfigs: configs.oracleAnalit
            };
            var replication = new (require('../services/replication_service'))();

            replication.init(replicationParams, done);
        });
    }
});