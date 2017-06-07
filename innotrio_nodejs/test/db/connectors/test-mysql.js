suite('MysqlConnector', function () {
    if (!mysql)throw new Error('You should create object "mysql" with configs for local server');
    var MysqlConnector = require('../../../db/classes/connectors/mysql');
    test('#connect', function (done) {
        var mysqlConnector = new MysqlConnector(mysql);
        mysqlConnector.connect(done);
    });
});