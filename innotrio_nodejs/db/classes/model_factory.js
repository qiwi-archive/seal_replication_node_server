module.exports = ModelFactory;
var Model = require('./model');

/**
 * Фабрика для создания моделей
 * @param db
 * @constructor
 */
function ModelFactory(db) {
    this.db = db;
}

/**
 * Создает новую модель с методами
 * @param methods
 * @returns {*|exports}
 */
ModelFactory.prototype.methods = function (methods) {
    return new Model(this.db).methods(methods);
}

