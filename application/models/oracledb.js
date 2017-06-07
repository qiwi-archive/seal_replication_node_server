module.exports = model.methods({
    getDbData: function (db, sql, cb) {
        var connectionStr;
        switch (db) {
            case 'qwstat':
                connectionStr = configs.oracleQwStat;
                break;
            case 'qw':
                connectionStr = configs.oracleQw;
                break;
            case 'qdanalit':
                connectionStr = configs.oracleAnalit;
                break;
            default:
                return cb('NO_SUCH_DB');
        }

        var oracle = new (require('../services/oracle_service'))();
        oracle.connect(connectionStr, function (err, result) {
            if (err != null)
                return cb(err);
            oracle.getRows(sql,//"select DISTINCT 'QW_' ||provider from QIWI_SITE.CHECKOUT_REDIRECT_OFF",
                null, function (err, result) {
                    oracle.closeConnection();
                    if (err != null)
                        return cb(err);
                    cb(null, result);
                });
        });
    }
});