module.exports = (function () {
    var Validator = require('./classes/validator');

    return{
        validator: function (data) {
            return new Validator(data);
        }
    };
})();