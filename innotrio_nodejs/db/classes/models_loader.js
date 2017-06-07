module.exports =ModelsLoader;
    var utils = require('../../utils');

    /**
     * Загрузчик моделей из папки. Возвращает в формате {Filename:model}
     * @param configs
     * @constructor
     */
     function ModelsLoader (configs) {

        configs = configs || {};

        this.configs = {
            modelsPath: configs.modelsPath || 'models'
        };
    }

    /**
     * Считывает модели из указанной папки.
     * @returns {*}
     */
    ModelsLoader.prototype.load = function () {
        return utils.readDir(this.configs.modelsPath, true);
    }
