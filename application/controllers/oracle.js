module.exports = controller('oracle')
    .actionGet('get_db_data', function (req, validator) {
        validator(req.query.code).matches(configs.oracleApiRequestCode).return();
        return {
            db: validator(req.query.db).exists().escape(),
            sql:decodeURIComponent(validator(req.query.sql).exists().return())
        };
    }, function (req, data, done) {
        models.Oracledb.getDbData(data.db,data.sql,done);
    });