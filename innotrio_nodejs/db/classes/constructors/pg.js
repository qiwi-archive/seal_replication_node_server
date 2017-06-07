module.exports = PgConstructor;
var util = require('util');
var _ = require('underscore');
var _s = require('underscore.string');
var SqlConstructor = require('./sql');

util.inherits(PgConstructor, SqlConstructor);

/**
 * Конструктор запросов для Postgres
 * @namespace SqlConstructor.PgConstructor
 * @augments SqlConstructor
 * @param table
 * @constructor
 */
function PgConstructor(table) {
    SqlConstructor.call(this, table);
}

/**
 *
 * @private
 * @param table
 * @param columns
 * @param values
 * @returns {string}
 */
PgConstructor.prototype.getInsertStatement = function (table, columns, values) {
    return 'INSERT INTO ' + table + columns + ' VALUES' + values + ' RETURNING *;';

}
