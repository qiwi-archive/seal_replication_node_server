module.exports = SqlConstructor;
var _ = require('underscore');
var _s = require('underscore.string');

/**
 * Конструктор для SQL запросов
 * @namespace SqlConstructor
 * @param table
 * @constructor
 */
function SqlConstructor(table) {
    this.table = table;
}

/**
 * Оборачивает в кавычки
 * @private
 * @param value
 * @returns {string}
 */
SqlConstructor.prototype.quote = function (value) {
    if (value === '')return 'NULL';
    return 'string' === typeof value ? this.escape(value) : value;
}

/**
 * Возвращает часть выражения SET column_name=column_value
 * @private
 * @param obj
 * @returns {string}
 */
SqlConstructor.prototype.getSet = function (obj) {
    return 'SET ' + this.getEquals(obj).join(',');
}

/**
 * Возращает перечисление колонок для INSERT
 * @private
 * @param columns
 * @returns {string}
 */
SqlConstructor.prototype.getInsertColumns = function (columns) {
    var _columns = _.map(columns, function (column) {
        return _s.underscored(column)
    });
    return '(' + _columns.join(',') + ')';
}


/**
 * Возвращает перечисление значений для INSERT
 * @private
 * @param values
 * @returns {string}
 */
SqlConstructor.prototype.getInsertValues = function (values) {
    var self = this;
    return '(' + _.map(values, function (value) {
        return self.quote(value);
    }).join(',') + ')';
}

/**
 * Возвращает INSERT запрос
 * @private
 * @param table
 * @param columns
 * @param values
 * @returns {string}
 */
SqlConstructor.prototype.getInsertStatement = function (table, columns, values) {
    return 'INSERT INTO ' + this.table + columns + ' VALUES' + values + ';';
}

/**
 * Возвращает часть выражения формата column_name=column_value
 * @private
 * @param obj
 * @returns {*}
 */
SqlConstructor.prototype.getEquals = function (obj) {
    var self = this;
    return _.map(obj, function (value, key) {
        return _s.underscored(key) + '=' + ( 'object' === typeof value ? value.raw : self.quote(value));
    });
}

/**
 * Связывает условия AND перечислением
 * @private
 * @param obj
 * @returns {*|string}
 */
SqlConstructor.prototype.getAndConditions = function (obj) {
    var arr;
    if (obj instanceof Array) {
        arr = obj;
    } else {
        arr = this.getEquals(obj);
    }
    return arr.join(' AND ');
}

/**
 * Связывает условия OR перечислением
 * @private
 * @param obj
 * @returns {*|string}
 */
SqlConstructor.prototype.getOrConditions = function (obj) {
    var arr;
    if (obj instanceof Array) {
        arr = obj;
    } else {
        arr = this.getEquals(obj);
    }
    return arr.join(' OR ');
}

/**
 * Возвращает WHERE выражение
 * @private
 * @param obj
 * @returns {string}
 */
SqlConstructor.prototype.getWhereStatement = function (obj) {
    if (!obj) {
        return '';
    }
    var self = this;
    var conditions;
    if (obj instanceof Array) {
        conditions = this.getOrConditions(_.map(obj, function (obj) {
            return '(' + self.getAndConditions(obj) + ')';
        }));
    } else {
        conditions = this.getAndConditions(obj);
    }
    return 'WHERE ' + conditions;
}


/**
 * Связывает значения запятой
 * @private
 * @param multiValues
 * @returns {*|string}
 */
SqlConstructor.prototype.concatValues = function (multiValues) {
    return multiValues.join(',');
}

/**
 * Возвращает SELECT запрос
 * @param obj
 * @returns {string}
 */
SqlConstructor.prototype.select = function (obj) {
    if ('object' !== typeof obj)throw new Error('First argument must be an Object or Array');

    var where = this.getWhereStatement(obj);

    return 'SELECT * FROM ' + this.table + ' ' + where + ';';
}

/**
 * Возвращает INSERT запрос
 * @public
 * @param {object|object[]} obj
 * @returns {string}
 */
SqlConstructor.prototype.insert = function (obj) {
    if ('object' !== typeof obj)throw new Error('First argument must be an Object or Array');
    var self = this;
    var columns;
    var values;
    if (obj instanceof Array) {
        if (obj.length == 0) {
            throw new Error('Array could not be empty');
            return '';
        }

        columns = this.getInsertColumns(Object.keys(obj[0]));

        values = this.concatValues(_.map(obj, function (row) {
            return  self.getInsertValues(_.values(row));
        }));
    } else {
        columns = this.getInsertColumns(Object.keys(obj));
        values = this.getInsertValues(_.values(obj));
    }

    return this.getInsertStatement(this.table, columns, values);
}

/**
 * Возвращает DELETE запрос
 * @public
 * @param {object|object[]} obj
 * @returns {string}
 */
SqlConstructor.prototype.delete = function (obj) {
    if ('object' !== typeof obj)throw new Error('First argument must be an Object or Array');

    var where = this.getWhereStatement(obj);

    return 'DELETE FROM ' + this.table + ' ' + where + ';';
}

/**
 * Возвращает UPDATE запрос
 * @public
 * @param {object|object[]} obj
 * @returns {string}
 */
SqlConstructor.prototype.update = function (obj) {
    if ('object' !== typeof obj)throw new Error('First argument must be an Object or Array');

    var where = this.getWhereStatement(obj.where);
    var set = this.getSet(obj.set);

    return 'UPDATE ' + this.table + ' ' + set + ' ' + where;
}


/**
 *
 * @param value
 * @returns {string}
 */
SqlConstructor.prototype.escape = function (value) {
    if (value === undefined || value === null) {
        return 'NULL';
    }

    switch (typeof value) {
        case 'boolean':
            return (value) ? 'true' : 'false';
        case 'number':
            return value + '';
    }

    var brCount = 0;
    value = value.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
        switch (s) {
            case "\'":
                return "''";
            case "\n":
                brCount++
                if (brCount > 5)
                    return "";
                return "<br/>";
            case "\0":
            case "\r":
            case "\b":
            case "\t":
            case "\x1a":
                return "";
            case '\\':
                return "\\";
            default:
                return "\\" + s;
        }
    });
    return "'" + value + "'";
}