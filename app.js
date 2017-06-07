/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    async = require('async'),
    router = require('./innotrio_nodejs/express/router').router,
    modelsLoader = require('./innotrio_nodejs/db').modelsLoader,
    pg = require('./innotrio_nodejs/db').pg,
    errors = require('./application/errors'),
    configFile = require('./application/configs/app'),
    logger = require('./innotrio_nodejs/logger/index').logger,
    fs = require('fs');

var env = process.env.NODE_ENV === 'development' ? 'development' : 'production',
    configs = configFile[env];

GLOBAL['ERRORS'] = errors;

GLOBAL.configs = configs;
GLOBAL.waterfall = async.waterfall;
GLOBAL.async = async;
GLOBAL.series = async.series;
GLOBAL.each = async.each;
GLOBAL.forEachOf = async.forEachOf;
GLOBAL.parallel = async.parallel;
GLOBAL.map = async.map;
GLOBAL.logger = logger;
GLOBAL.fs = fs;

var dbObject = pg(configs.db);

dbObject.client.on('error', function (error) {
    console.log('[ERROR] Data base error - ' + error);
    setTimeout(function () {
        process.exit(1);
    }, 5000);
});

GLOBAL.services = {
    db: dbObject.connect()
};

GLOBAL.controller = require('./innotrio_nodejs/express/controller').controller;
GLOBAL.model = require('./innotrio_nodejs/db').modelFactory(services.db);

GLOBAL.models = modelsLoader({
    modelsPath: 'application/models'
}).load();

process.on('uncaughtException', function (err) {
    console.log(err.stack);
    console.log(err);
});

//CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var app = express();

// all environments
app.set('port', process.env.PORT || configs.port);

app.use(express.cookieParser(configs.cookies.secret));
app.use(express.cookieSession());
app.use(express.compress());
app.use(express.favicon());
if (env === 'development') {
    app.use(express.logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(allowCrossDomain);
app.use(express.errorHandler());

router(app, {
    root: configs.url,
    controllersPath: 'application/controllers',
    authMiddleware: require('./application/middlewares/authentication')
}).route();

var httpServer = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


// Задачи cron
var cronTasks = new (require('./cron_tasks'))();
if (env != 'development') {
    cronTasks.init();
}