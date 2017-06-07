/**
 * User: g.konnov
 * Date: 09.07.12
 * Time: 12:19
 */
var AuthManager = require('./auth_manager').AuthManager,
	PgSql = require('../db/db_pg').PgSql,
    CommandRouter = require('../../innotrio_nodejs/router/command_router').CommandRouter,
    MandrillManager = require('../mandrill/mandrill_manager').MandrillManager,
    check = require('validator').check,
    sanitize = require('validator').sanitize;


var AuthRouter = function(config) {
	this.db = new PgSql();
	this.db.connect(config.dbConfig);

    this.mandrillMngr = new MandrillManager(config.mandrillConfig);

	this.manager = new AuthManager(this.db, this.mandrillMngr);
};

AuthRouter.prototype = new CommandRouter();

AuthRouter.prototype._doRoute = function(action, command) {
    var self = this;
    switch (action)
	{
		case 'check':
            command.errorCode = 'AUTH_CHECK_USER_ERROR';
            this._validateCheckUserParams(command.next(function(command) {
                self.manager.checkUser(command);
            }));
            break;
        case 'auth':
            command.errorCode = 'AUTH_USER_ERROR';
            this._validateAuthUserParams(command.next(function(command) {
                self.manager.auth(command);
            }));
            break;
		case 'reg':
            command.errorCode = 'REG_USER_ERROR';
            this._validateRegUserParams(command.next(function(command) {
                self.manager.reg(command);
            }));
			break;
        case 'change_pass':
            command.errorCode = 'CHANGE_PASS_ERROR';
            this._validateChangePassParams(command.next(function(command) {
                self.manager.changePass(command);
            }));
            break;
        case 'reset_pass_request':
            command.errorCode = 'RESET_PASS_REQUEST_ERROR';
            this._validateResetPassRequestParams(command.next(function(command) {
                self.manager.resetPassRequest(command);
            }));
            break;
        case 'reset_pass':
            command.errorCode = 'RESET_PASS_ERROR';
            this._validateResetPassParams(command.next(function(command) {
                self.manager.resetPass(command);
            }));
            break;
		default:
			this._noAction(response);
			break;
	}
};

AuthRouter.prototype._validateCheckUserParams = function(command) {
    var params = command.params;
    try {
        params.email = sanitize(params.email).escape().toLowerCase().trim();
        check(params.email).isEmail();
    } catch (e) {
        this.sendValidationError(command);
        return;
    }
    command.callNext([], 'validateAuthCheckUser');
};

AuthRouter.prototype._validateRegUserParams = function(command) {
    var params = command.params;
    try {
        params.email = sanitize(params.email).escape().toLowerCase().trim();
        check(params.email).isEmail().notEmpty();
    } catch (e) {
        this.sendValidationError(command);
        return;
    }
    command.callNext([], 'validateRegUser');
};

AuthRouter.prototype._validateAuthUserParams = function(command) {
    var params = command.params;
    try {
        params.email = sanitize(params.email).escape().toLowerCase().trim();
        check(params.email).isEmail().notEmpty();
        params.pass = sanitize(params.pass).escape();
        check(params.pass).len(4);
    } catch (e) {
        this.sendValidationError(command);
        return;
    }
    command.callNext([], 'validateAuthUser');
};

AuthRouter.prototype._validateResetPassRequestParams = function(command) {
    var params = command.params;
    try {
        params.email = sanitize(params.email).escape().toLowerCase().trim();
        check(params.email).isEmail();
    } catch (e) {
        this.sendValidationError(command);
        return;
    }
    command.callNext([], 'validateResetPassRequest');
};

AuthRouter.prototype._validateResetPassParams = function(command) {
    var params = command.params;
    try {
        params.code = sanitize(params.code).escape();
        check(params.code).isUUID();
    } catch (e) {
        this.sendValidationError(command);
        return;
    }
    command.callNext([], 'validateResetPass');
};

AuthRouter.prototype._validateChangePassParams = function(command) {
    var params = command.params;
    try {
        params.email = sanitize(params.email).escape().toLowerCase().trim();
        check(params.email).isEmail();
        params.pass = sanitize(params.pass).escape();
        check(params.pass).len(4);
        params.newPass = sanitize(params.newPass).escape();
        check(params.newPass).len(4);
    } catch (e) {
        this.sendValidationError(command);
        return;
    }
    command.callNext([], 'validateChangePass');
};

exports.AuthRouter = AuthRouter;