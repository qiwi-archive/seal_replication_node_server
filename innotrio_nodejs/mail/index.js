var MandrillService = require('./classes/mandrill_service'),
    logger = require('../logger/index').logger;

module.exports = {
    mailApi: function (config) {
        if (!this._mailService)
            this._mailService = new MandrillService(config, logger);

        return this._mailService;
    }
};