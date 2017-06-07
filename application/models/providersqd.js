module.exports = model.methods({
    replicate: function (done, isForce) {
        var self = this;
        this._init(function (err, replication) {
            if (err != null)
                return done(err);

            replication.replicate(done, isForce);
        });

    },
    _init: function (done) {
        var replication = new (require('../services/replication_service'))();
        var tableName = 'tmp_provider_qd';
        var replicationType = 'PROVIDERS_QD';
        var sqlMap = {
                tableName: tableName,
                replicationTypeQuoted: '\'' + replicationType + '\''
            };

        parallel([
            function (done) {
                fs.readFile(__dirname + '/sql/providers/drop_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/providers/create_tmp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/providers/qd/oracle_select.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/providers/qd/insert_temp_table.sql', 'utf-8', done);
            }, function (done) {
                fs.readFile(__dirname + '/sql/providers/qd/upsert_obj_provider.sql', 'utf-8', done);
            }
        ], function (error, results) {
            if (error)
                return done(error);

            var replicationParams = {
                sqlMap: sqlMap,
                replicationType: replicationType,
                dropTmpTableSql: results[0],
                createTmpTableSql: results[1],
                externalDbSelectSql: results[2],
                pgInsertSql: results[3],
                pgCopySqls: results.slice(4),
                externalDb: 'oracle',
                externalDbConfigs: configs.oracleAnalit
            };
            replication.init(replicationParams, done);
        });
    }
});