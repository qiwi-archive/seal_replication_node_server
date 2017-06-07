module.exports = MandrillService;

var Mandrill = require('mandrill-api/mandrill').Mandrill;

function MandrillService(config, logger) {
    this.mandrill = new Mandrill(config.apiKey, config.debug);
    this.apiKey = config.apiKey;
    this.debug = config.debug;
    this.debugPrint = config.debugPrint;
    this.logger = logger;

    this.replyTo = config.replyTo;
    this.website = config.website;
};

MandrillService.prototype.sendTemplate = function (templateName, emails, data, subject) {
    var msgVars = [],
        to = [];
    Object.keys(data).forEach(function (key) {
        msgVars.push({name: key, content: data[key]});
    });

    var emailsLength = emails.length;
    for (var i = 0; i < emailsLength; i++) {
        to.push({
            email: emails[i]
        });
    }

    var msg = {
        global_merge_vars: msgVars,
        to: to};
    if (subject || false){
        msg.subject = subject;
    }
    this._sendTemplate(templateName, msg)
}

MandrillService.prototype._sendTemplate = function (template, data) {
    var self = this;
    if (!data.headers){
        data.headers = {};
    }
    data.headers["Reply-To"] = this.replyTo;
    if (!data.metadata){
        data.metadata = {};
    }
    data.metadata["website"] = this.website;
    data["async"] = true;

    if (this.debug) {
        if (this.debugPrint)
            self.logger.log('DEBUG_MAIL_SEND_TEMPLATE', '', data);
    } else {
        this.mandrill.messages.sendTemplate({template_name: template, template_content: [], message: data},
            function (res) {
            },
            function (err) {
                self.logger.log('MAIL_SEND_TEMPLATE_ERROR', '', err);
            });
    }
};



/*MandrillService.prototype._send = function (data, cb) {
 var self = this;
 if (this.debug) {
 self.logger.log('DEBUG_MAIL_SEND', '', data);
 cb();
 } else {
 this.mandrill.messages.send({message: data},
 function (res) {
 cb(null, res);
 },
 function (err) {
 self.logger.log('MAIL_SEND_ERROR', '', err);
 cb(err);
 });
 }
 }*/
