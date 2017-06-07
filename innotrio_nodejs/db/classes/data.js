module.exports = Data;
var util = require('util');
var _ = require('underscore');
var _s = require('underscore.string');

/**
 * Класс для переименования колонок запроса в PostGre
 * @param db Экземпляр класса
 * @param map Может быть строкой с именами колонок базы в формате undescored 'user_id,user_name' и т.д. через запятую - на выходе колонки будут перименованы в camelCase: userId, userName
 * Может быть массивом имен колонок [['user_id','user_name']]
 * Может быть объектом {{id:'user_id',name:'user_name'}}
 * @constructor
 * @throws Second argument must be Object, String or Array
 */
function Data(db, map) {
    this.db = db;
    this.map = {};

    var self = this;
    if ('object' === typeof map && !util.isArray(map)) {
        this.map = map;
    } else if (util.isArray(map) || 'string' === typeof map) {
        var mapArray;
        if ('string' === typeof map) {
            mapArray = map.split(',');
        } else {
            mapArray = map;
        }
        mapArray.forEach(function (column) {
            column = _s.trim(column);
            self.map[_s.camelize(column)] = column;
        });
    } else {
        if (process.env.NODE_ENV === 'development') {
            throw Error('Second argument must be Object, String or Array');
        }
    }
}

/**
 * Переименование одной строчки из базы
 * @param row {{user_name:'username',user_id:1}}
 * @returns {{}}
 */
Data.prototype.mapRow = function (row) {
    var self = this,
        mappedRow = {};
    if (row !== null)
        Object.keys(this.map).forEach(function (key) {
            if (row.hasOwnProperty(self.map[key])) {
                mappedRow[key] = row[self.map[key]];
            }
        });
    return mappedRow;
}

/**
 * Переименование массива строчек
 * @param rows
 * @returns {Array}
 */
Data.prototype.mapRows = function (rows) {
    var self = this;
    var mappedRows = [];
    rows.forEach(function (row) {
        mappedRows.push(self.mapRow(row));
    });
    return mappedRows;
}

/**
 * Обертка для callback
 * @param callback
 * @param returnRow возвращаем только ону строку в результате, если true
 * @returns {Function}
 * @throws Callback must be a function
 */
Data.prototype.getResponseHandler = function (callback, returnRow) {
    var self = this,
        returnRow = returnRow || false;
    if ('function' !== typeof callback)throw Error('Callback must be a function');
    return function (error, rows) {
        if (error) {
            return callback(error);
        }
        if (rows === false) {
            return callback(null, false);
        }

        if (util.isArray(rows)) {
            if (!returnRow) {
                callback(null, self.mapRows(rows));
            } else {
                callback(null, self.mapRow(rows[0]));
            }
        } else {
            callback(null, self.mapRow(rows));
        }
    }
}

/**
 * Выполняет подстановку в SELECT * FROM значения колонок из map SELECT some_column,another_column FROM
 * @param query
 * @returns {string}
 */
Data.prototype.insertColumns = function (query) {
    return query.replace(/\*/g, _.values(this.map).join(','));
}

/**
 * Далее идут оберки для запросов к базе
 */

/**
 * Выполнение запроса и возврат одной строчки
 * @param query
 * @param params
 * @param done
 */
Data.prototype.getRow = function (query, params, done) {
    this.db.getRow(this.insertColumns(query), params, this.getResponseHandler(done));
}

/**
 * Выполнение запроса и возврат всех строчек
 * @param query
 * @param params
 * @param done
 */
Data.prototype.getRows = function (query, params, done) {
    this.db.getRows(this.insertColumns(query), params, this.getResponseHandler(done));
}

/**
 * Выполнение запроса и возврат всех строчек
 * @param query
 * @param params
 * @param done
 */
Data.prototype.getArr = function (query, params, done) {
    this.db.getRows(this.insertColumns(query), params, function (error, result) {

        if (error)
            return done(error);

        if (!result || result.length == 0) {
            return done(error, []);
        }

        var item = result[0],
            key,
            keys = Object.keys(item),
            itemsCount = result.length,
            resultArr = [];

        if (keys.length != 1) {
            logger.log('ERROR_TOO_MUCH_KEYS', 'getCol', {query: query, params: params, keys: keys});
            return done('ERROR_TOO_MUCH_KEYS');
        }
        key = keys[0];

        for (var i = 0; i < itemsCount; i++) {
            resultArr.push(result[i][key]);
        }

        done(error, resultArr);
    });
}

/**
 * Выполнение SELECT
 * @param table
 * @param where
 * @param done
 */
Data.prototype.select = function (table, where, done) {
    this.db.select(table, where, this.getResponseHandler(done));
}

/**
 * Выполнение SELECT
 * @param table
 * @param where
 * @param done
 */
Data.prototype.selectAll = function (table, where, done) {
    this.db.selectAll(table, where, this.getResponseHandler(done));
}

/**
 * Выполнение запроса на добавление данных в таблицу
 * @param table
 * @param obj
 * @param done
 */
Data.prototype.insert = function (table, obj, done) {
    this.db.insert(table, obj, this.getResponseHandler(done));
}

/**
 * Выполнение запроса на добавление данных в для одной записи
 * @param table
 * @param obj
 * @param done
 */
Data.prototype.insertOne = function (table, obj, done) {
    this.db.insert(table, obj, this.getResponseHandler(done, true));
}

