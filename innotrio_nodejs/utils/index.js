module.exports = (function () {
    var fs = require('fs');
    var _s = require('underscore.string');
    var path = require('path');
    var readDir = function (pathToDir, asObject) {
        asObject = 'undefined' === asObject ? false : asObject;
        if (asObject) {
            var modules = {};
            fs.readdirSync(pathToDir).forEach(function (filename) {
                modules[_s.classify(path.basename(filename,'.js'))] = require(path.relative(__dirname, pathToDir + '/' + filename));
            });

            return modules;
        } else {
            var modules = [];
            fs.readdirSync(pathToDir).forEach(function (filename) {
                modules.push(require(path.relative(__dirname, pathToDir + '/' + filename)));
            });

            return modules;
        }
    };

    var Transformer = require('./classes/transformer');


    return {
        readDir: readDir,
        transformer: function (data) {
            return new Transformer(data);
        }
    };
})();