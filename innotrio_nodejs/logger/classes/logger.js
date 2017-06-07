module.exports = (function () {
    var Logger = function () {
        if (Logger.prototype._instance) {
            return Logger.prototype._instance;
        }
        Logger.prototype._instance = this;
    }

    /**
     * Логируем. Дата добавится автоматически
     * @param code Код ошибки
     * @param message текст ошибки
     * @param object объект, который перекодируется из json в текст
     */
    Logger.prototype.log = function (code, message, object) {
        var objectText = '';
        if (object !== undefined) {
            objectText = JSON.stringify(object);
        }

        console.log((new Date()).toISOString() + "Error \n" + code + ": " + message + "\ndata: " + objectText);
    }

    return Logger;
})();