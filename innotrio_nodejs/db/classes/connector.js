module.exports = Connector;
var util = require('util');
var logger = require('../../logger/index').logger;

/**
 * Суперкласс для наследования коннекторов различных типов баз данных
 * @namespace Connector
 * @param connectionString
 * @constructor
 */
function Connector(connectionString) {
    if ('function' !== typeof this.getClient) {
        throw new Error('Method getClient required');
    }

    if ('function' !== typeof this.getConstructorClass) {
        throw new Error('Method getConstructorClass required');
    }

    this.client = this.getClient(connectionString);
    this.Constuctor = this.getConstructorClass();
};

/**
 * подключиться к серверу
 * @param cb
 * @returns {exports}
 */
Connector.prototype.connect = function (cb) {

    if (cb) {
        this.client.connect(cb);
    } else {
        this.client.connect();
    }

    return this;
};

/**
 * Простой запрос
 * @param query
 * @param params
 * @param done
 */
Connector.prototype.run = function (query, params, done) {
    if ('function' !== typeof this.formatResults) {
        throw new Error('Method getClient required');
    }
    var self = this;
    this.client.query(query, params, function (error, results) {
        if (error) {
            logger.log('DB_ERROR',query + '\n' + error.message,params);

            if (done !==undefined)
                return done('DB_ERROR');
        }
        if (done !==undefined)
            return done(null, self.formatResults(results));
    });
}

/**
 * Закрыть соединение
 */
Connector.prototype.end = function () {
    this.client.end();
}

/**
 * Вернуть результат в виде массива объектов или false
 * @param query
 * @param params
 * @param done
 */
Connector.prototype.getRows = function (query, params, done) {
    this.run(query, params, function (err, result) {
        if (err)return done(err);
        var rows = (result.rows == undefined ? false : result.rows);
        done(null, rows);
    });
}

/**
 * Вернуть результат в виде одного объекта или false
 * @param query
 * @param params
 * @param done
 */
Connector.prototype.getRow = function (query, params, done) {
    this.run(query, params, function (err, result) {
        if (err)return done(err);
        var row = (result.rows[0] == undefined ? false : result.rows[0]);
        if (result.rows.length>1){
            console.log('WARNING! Expected 1 row. %j', result.rows)
        }
        done(null, row);
    });
}

/**
 * Выполнить select
 * @param table
 * @param obj
 * @param done
 */
Connector.prototype.selectAll = function (table, obj, done) {
    var constructor = new this.Constuctor(table);
    this.run(constructor.select(obj), [], function (err, result) {
        if (err)return done(err);
        var row = (result.rows == undefined ? false : result.rows);
        done(null, row);
    });
}

/**
 * Выполнить select
 * @param table
 * @param obj
 * @param done
 */
Connector.prototype.select = function (table, obj, done) {
    var constructor = new this.Constuctor(table);
    this.run(constructor.select(obj), [], function (err, result) {
        if (err)return done(err);
        var row = (result.rows[0] == undefined ? false : result.rows[0]);
        done(null, row);
    });
}


/**
 * Выполнить insert
 * @example
 * //INSERT INTO table_name(id_table,table_column) VALUES(1,'column');
 * pg.insert('table_name',{idTable:1,tableColumn:'column'},done);
 * @example
 * //INSERT INTO table_name(id_table,table_column) VALUES(1,'column'),(2,'column2');
 * pg.insert('table_name',[{idTable:1,tableColumn:'column'},{idTable:2,tableColumn:'column2'],done);
     * @param table имя таблицы
 * @param obj объект/массив в формате колонкаТаблицы(/колонка_таблицы):значение /[колонкаТаблицы(/колонка_таблицы):значение,колонкаТаблицы(/колонка_таблицы):значение]
 * @param done
 */
Connector.prototype.insert = function (table, obj, done) {
    var constructor = new this.Constuctor(table);
    this.run(constructor.insert(obj), [], function (err, result) {
        if (err)return done(err);
        var row = (result.rows == undefined ? false : result.rows);
        done(null, row);
    });
}

/**
 * Выполнить delete
 * @example
 * //DELETE FROM table_name WHERE id_table=1 AND table_column='column';
 * pg.delete('table_name',{idTable:1,tableColumn:'column'},done);
 * //DELETE FROM table_name WHERE (id_table=1 AND table_column='column') OR (id_table=2 AND table_column='column2');
 * pg.delete('table_name',[{idTable:1,tableColumn:'column'},{idTable:2,tableColumn:'column2'}],done);
 * @param table имя таблицы
 * @param obj объект/массив в формате колонкаТаблицы(/колонка_таблицы):значение
 * @param done
 */
Connector.prototype.delete = function (table, obj, done) {
    var constructor = new this.Constuctor(table);
    this.run(constructor.delete(obj), [], function (err, result) {
        if (err)return done(err);
        var row = (result.rows[0] == undefined ? false : result.rows[0]);
        done(null, row);
    });
}

/**
 * Последовательно выполнить delete затем insert
 * @param table
 * @param obj
 * @param done
 */
Connector.prototype.refresh = function (table, obj, done) {
    var self = this;
    this.delete(table, obj, function (err) {
        if (err)return done(err);
        self.insert(table, obj, done);
    });
}

/**
 * Выполнить UPDATE
 * @example
 * //UPDATE table_name SET table_column1=1,table_column2='column2' WHERE id_table=1;
 * pg.update('table_name',{tableColumn1:1,tableColumn2:'column2'},{idTable:1},done);
 * @example
 * //UPDATE table_name SET table_column=table_column+1 WHERE id_table=1 OR id_table=2;
 * pg.update('table_name',{tableColumn:'table_column+'+1},[{idTable:1},{idTable:2}],done);
 * @param table - имя таблицы
 * @param set - объект в формате колонкаТаблицы:значение({raw:значение_которое_нужно_оставить_без_кавычек})
 * @param where - объект/массив в формате колонкаТаблицы(/колонка_таблицы):значение /[колонкаТаблицы(/колонка_таблицы):значение,колонкаТаблицы(/колонка_таблицы):значение]
 * @param done
 */
Connector.prototype.update = function (table, set, where, done) {
    var constructor = new this.Constuctor(table);
    this.run(constructor.update({set: set, where: where}), [], function (err, result) {
        if (err)return done(err);
        var rows = (result.rows == undefined ? false : result.rows);
        done(null, rows);
    });
}

Connector.prototype.tmplReplace = function (tmpl, search, replace) {
    return tmpl.split(search).join(replace);
}

