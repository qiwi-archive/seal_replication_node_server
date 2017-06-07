module.exports = Mysql;
var util = require('util');
var mysql = require('mysql');
var Connector = require('../connector');
var MysqlConstructor = require('./../constructors/mysql');

util.inherits(Mysql, Connector);

/**
 * Коннектор для MySQL
 * @namespace Connector.Mysql
 * @augments Connector
 * @param connectionString
 * @constructor
 */
function Mysql(connectionString) {
    Connector.call(this, connectionString);
}

/**
 *
 * @param connectionString
 * @returns {*}
 */
Mysql.prototype.getClient = function (connectionString) {
    return  mysql.createConnection(connectionString);
}

/**
 *
 * @returns {MysqlConstructor|exports}
 */
Mysql.prototype.getConstructorClass = function () {
    return MysqlConstructor;
}

Mysql.prototype.formatResults = function (rows) {
    return {
        rows: rows
    };
}

