module.exports = Model;
    var util = require('util');
    var _ = require('underscore');
    var Data = require('./data');

    /**
     * Модель представляет собой справочник запросов к бд
     * @param db
     * @constructor
     */
    function Model (db) {
        this.db = db;
    }

    /**
     * Дата-мэппер. см. data.js
     * @param map
     * @returns {Data}
     */
    Model.prototype.data = function (map) {
        return new Data(this.db, map);
    }

    /**
     * Добавление методов в модель в формате {getUser:function(userId,done){...}}
     * @param methods
     * @returns {exports}
     */
    Model.prototype.methods = function (methods) {
        if ((!methods instanceof Object ) || util.isArray(methods)) throw new Error('Methods must be key->value object of methods');
        /*Object.keys(methods).forEach(function (key) {
            if ('function' !== typeof methods[key])throw new Error('Method must be a function');
        });*/
        _.extend(this, methods);
        return this;
    }

