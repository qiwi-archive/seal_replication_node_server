suite('PgConnector', function () {
    if (!pg)throw new Error('You should create object "pg" with configs for local server');
    var PgConnector = require('../../../db/classes/connectors/pg');
    test('#connect', function (done) {
        var pgConnector = new PgConnector(pg);
        pgConnector.connect(done);
    });
});