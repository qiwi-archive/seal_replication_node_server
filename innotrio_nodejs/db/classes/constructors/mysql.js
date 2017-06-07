module.exports = MysqlConstructor;
var util = require('util');
var _ = require('underscore');
var _s = require('underscore.string');
var SqlConstructor = require('./sql');

util.inherits(MysqlConstructor, SqlConstructor);

/**
 * Конструктор запросов для MySQL
 * @namespace SqlConstructor.MysqlConstructor
 * @augments SqlConstructor
 * @param table
 * @constructor
 */
function MysqlConstructor(table) {
    SqlConstructor.call(this, table);
}

