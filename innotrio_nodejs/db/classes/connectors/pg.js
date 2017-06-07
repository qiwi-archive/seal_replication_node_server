module.exports = Pg;
var util = require('util');
var pg = require('pg');
var Connector = require('../connector');
var PgConstructor = require('./../constructors/pg');

util.inherits(Pg, Connector);

/**
 * Коннектор для Postgres
 * @namespace Connector.Pg
 * @augments Connector
 * @param connectionString
 * @constructor
 */
function Pg(connectionString) {
    Connector.call(this, connectionString);
}

/**
 *
 * @param connectionString
 * @returns {exports.Client}
 */
Pg.prototype.getClient = function (connectionString) {
    return new pg.Client(connectionString);
}

/**
 *
 * @returns {PgConstructor|exports}
 */
Pg.prototype.getConstructorClass = function () {
    return PgConstructor;
}

Pg.prototype.formatResults = function (results) {
    return {
        rows: results.rows
    };
}