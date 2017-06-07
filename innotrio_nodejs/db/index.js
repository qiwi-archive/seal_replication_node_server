var Pg = require('./classes/connectors/pg');
var ModelFactory = require('./classes/model_factory');
var ModelsLoader = require('./classes/models_loader');
var PgConstructor = require('./classes/constructors/pg');

/**
 * @module db
 */
module.exports = {
    /**
     *
     * @property configs
     * @property modulepath
     * @returns {ModelsLoader}
     */
    modelsLoader: function (configs) {
        return new ModelsLoader(configs);
    },
    /**
     *
     * @param db
     * @returns {ModelFactory}
     */
    modelFactory: function (db) {
        return new ModelFactory(db);
    },
    /**
     *
     * @param connectionString
     * @returns {PgConnector}
     */
    pg: function (connectionString) {
        return new Pg(connectionString);
    },
    /**
     *
     * @param connectionString
     * @returns {MysqlConnector}
     */
    mysql: function (connectionString) {
        var Mysql = require('./classes/connectors/mysql');
        return new Mysql(connectionString);
    },
    /**
     *
     * @param table
     * @returns {PgConstructor}
     */
    constructor: function (table) {
        return new PgConstructor(table);
    }
};
