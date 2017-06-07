'use strict';
/**
 * User: g.konnov
 * Date: 02.07.12
 * Time: 16:22
 */
var AuthValidator = require('./auth_validator').AuthValidator,
    authValidator = new AuthValidator(),
    BaseManager = require('../managers/base_manager.js').BaseManager,
    //uuid = require('node-uuid'),
    CallbackResponse = require('../response/callback_response').CallbackResponse;

//user_role U - user, A - admin

var AuthManager = function(db, mandrillMngr) {
    this.init(db);
	this.hash = require('crypto');
    this.mandrillMngr = mandrillMngr;
};

AuthManager.prototype = new BaseManager();

AuthManager.prototype.reg = function(command,shouldForceRegistration) {
	var self = this;

    shouldForceRegistration=(shouldForceRegistration==undefined)||shouldForceRegistration

    this._getUser(command, function(userInfo) {
        if (!userInfo) {
            if(shouldForceRegistration)  {
                self._processReg(command);
            }else{
                command.userInfo={} ;
                command.sendError('USER_NOT_EXISTS');
            }
        } else {
            //Для внутреннего использования до отправки данных, при необходимости
            command.userInfo=userInfo;
            command.sendError('USER_EXISTS');
        }
    });
};

AuthManager.prototype._processReg = function(command) {
	var self = this,
        params = command.params,
        genPass = undefined,
        doRegCb = function(regInfo) {
            command.userInfo=regInfo;
            self._sendRegResult(command, regInfo, genPass);
        };

	if (params.pass !== undefined) {
        self._doReg(command, doRegCb);
    }
    else {
        self._generatePass(params.email, function(pass, generatedPass) {
            params.pass = pass;
            params.generatedPass = generatedPass;
            genPass = generatedPass;
            self._doReg(command, doRegCb);
        });
    }
};

AuthManager.prototype._sendRegResult = function (command, regInfo, generatedPass) {
    this.mandrillMngr.sendOnRegister(command.params.email, generatedPass);
    command.sendResult({id:regInfo.id_user, role:regInfo.user_role});
};

AuthManager.prototype._doReg = function (command, cb) {
	var self = this,
	    salt = Math.floor(1+Math.random()*100000),
	    params = command.params;
    this._generateSecPass(params.pass, salt, function(pass) {
        //Регистрируем пользователя
        self.db.run("INSERT INTO ip_user (user_email,user_pass,user_salt,user_name) VALUES ($1,$2,$3,$4) RETURNING id_user, user_role", [params.email,pass,salt,self._getUsernameFromEmail(params.email)], function(error,result){
            if (error) {
                self.sendDBError(command,error);
                return;
            }
            var row = result.rows[0];
            cb({id_user: row.id_user, user_role: row.user_role});
        });
    });
};

AuthManager.prototype.auth = function(command) {
   this._validatePass(command, function(userInfo) {
        command.sendResult({id: userInfo.id_user, role: userInfo.user_role});
   });
};

AuthManager.prototype.authOrRegVKontakte = function(params, response) {
    var self = this;
    authValidator.validateAuthOrRegVKontakteParams(params,function(result) {
        if (!result) {
            response.sendError('AUTH_PARAMS_ERROR');
            return;
        }

        var resultCb=response.sendResult;
        response.sendResult=function (userInfo){
            response.sendResult=resultCb;
            if (!userInfo) {
                // Зарегистрировать пользователя
                self.db.run("INSERT INTO ip_user (vk_id, user_name, user_photo, user_photo_small) VALUES ($1, $2, $3, $4) RETURNING id_user, user_role", [params.vkId, params.username, params.photo, params.photo_small], function(error,result){
                    if (error) {
                        response.sendError('REG_ERROR');
                        return;
                    }
                    var row = result.rows[0];
                    response.sendResult({id: row.id_user, role: row.user_role});
                });
            }
            else {
                // Авторизовать пользователя
                self.db.run("UPDATE ip_user SET user_name = $1, user_photo = $2, user_photo_small = $3 WHERE id_user = $4", [params.username, params.photo, params.photo_small, userInfo.id_user], function(error,result){
                    if (error) {
                        response.sendError('AUTH_ERROR');
                        return;
                    }
                    response.sendResult({id: userInfo.id_user, role: userInfo.user_role});
                });
            }
        };
        self._getUserVKontakte(params, response);
    });
};

/**
 * Проверяем существование пользователя
 * @param command
 */
AuthManager.prototype.checkUser = function(command) {
    this._getUser(command, function(userInfo) {
        if (!userInfo){
            command.sendResult({userExists:false});
        }
        else{
            command.sendResult({userExists:true});
        }
    });
};

AuthManager.prototype._getUser = function (command, cb) {
	var self = this;
    var sql = "SELECT id_user, user_salt, user_pass, user_role FROM ip_user WHERE user_email = $1 LIMIT 1";
    this.db.run(sql, [command.params.email], function(error,result) {
		if (error) {
            self.sendDBError(command, error);
			return;
		}

		if (Array.isArray(result.rows) && (result.rows.length > 0)) {
            cb(result.rows[0]);
        } else {
            cb();
        }
	});
};

AuthManager.prototype._getUserVKontakte = function (params, response){
    this.db.run("SELECT id_user, user_role FROM ip_user WHERE vk_id = $1 LIMIT 1", [params.vkId], function(error,result){
        if (error) {
            response.sendError('GET_USER_ERROR');
            return;
        }

        if (Array.isArray(result.rows) && (result.rows.length>0)){
            response.sendResult(result.rows[0]);
        } else
            response.sendResult();
    });
};

AuthManager.prototype.confirm = function(params, response) {
    var self = this;
    authValidator.validateConfirmParams(params,function(result) {
            if (!result) {
                response.sendError('CONFIRM_PARAMS_ERROR');
                return;
            }

            self._doConfirm(params,response);
    });
};

AuthManager.prototype._doConfirm = function (params, response){
    //Подтверждаем сессию (по возвращаемому значению судим, была ли найдена сессия с переданным кодом)
    this.db.run("UPDATE ip_sessions SET sys_status = 'a' WHERE sys_code = $1 RETURNING sys_status", [params.code], function(error,result){
        if (error || result.rows.length == 0)
        {
            response.sendError('CONFIRM_ERROR');
            return;
        }

        response.sendResult({});
    });
};

AuthManager.prototype.changePass = function(command) {
    var self = this;
    this._validatePass(command, function(userInfo) {
        var salt = Math.floor(1+Math.random()*100000);
        self._generateSecPass(command.params.newPass, salt, function(pass) {
            self.db.run("UPDATE ip_user SET user_pass = $1, user_salt = $2 WHERE id_user = $3", [pass, salt, userInfo.id_user], function(error/*,result*/){
                if (error) {
                    self.sendDBError(command, error);
                }
                else {
                    command.sendResult({});
                }
            });
        });
    });
};

AuthManager.prototype.resetPassRequest = function(command) {
    var self = this;
    this._getUser(command, function (userInfo) {
        if (!userInfo){
            command.sendError('USER_DOES_NOT_EXIST');
        }
        else {
            self.db.run("UPDATE ip_user SET sys_reset_pass = (SELECT uuid_generate_v4()) WHERE id_user = $1 RETURNING user_email, sys_reset_pass", [userInfo.id_user], function(error,result){
                if (error || result.rows.length == 0) {
                    command.sendError(error);
                }
                else {
                    result = result.rows[0];
                    self.mandrillMngr.sendOnResetPassRequest(result.user_email, result.sys_reset_pass);
                    command.sendResult({});
                }
            });
        }
    });
};

AuthManager.prototype.resetPass = function(command) {
    var self = this;
    self.db.run("SELECT id_user, user_email, user_role FROM ip_user WHERE sys_reset_pass = $1", [command.params.code], function(error,result){
        if (error || result.rows.length == 0){
            command.sendError(error);
            return;
        }
        var userInfo = result.rows[0];
        self._generatePass(userInfo.user_email, function(pass, generatedPass) {
            var salt = Math.floor(1+Math.random()*100000);
            self._generateSecPass(pass,salt,function(pass){
                self.db.run("UPDATE ip_user SET user_pass = $1, user_salt = $2, sys_reset_pass = NULL WHERE id_user = $3", [pass,salt,userInfo.id_user], function(error,result){
                    if (error) {
                        self.sendDBError(command, error);
                        return;
                    }
                    self.mandrillMngr.sendOnResetPassSuccess(userInfo.user_email, generatedPass);
                    command.sendResult({id: userInfo.id_user, role: userInfo.user_role});
                });
            });
        });
    });
};

AuthManager.prototype._validatePass = function (command, cb) {
    var self = this;
    this._getUser(command, function (userInfo) {
        if (!userInfo) {
            command.sendError('ERROR_NO_USER');
        }
        else {
            // Проверяем на совпадение паролей
            self._generateSecPass(command.params.pass, userInfo.user_salt, function(probablePass) {
                if (userInfo.user_pass == probablePass)
                    cb(userInfo);
                else
                    command.sendError('ERROR_INCORRECT_PASS', null, true);
            });
        }
    });
};

/**
 * Создаем устойчивый пароль, который хранится в базе
 * @param pass принятый пароль
 * @param salt соль
 * @return созданный пароль
 */
AuthManager.prototype._generateSecPass = function (pass, salt, callback){
    callback(this.hash.createHash('sha256').update(pass+salt.toString()).digest('base64'));
};

AuthManager.prototype._generatePass = function (email, callback){
    var alphabet = 'abcdefghijklmonpqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@@@@@$$$$$';
    var generatedPass = '';
    for (var i = 0; i < 8; i++){
        generatedPass += alphabet[Math.floor(Math.random()*alphabet.length)];
    }

    var pass = generatedPass;
    var cycleCount = 2 + email.length % 5;
    for (var i=0; i < cycleCount; i++)
    {
        pass=this.hash.createHash('sha256').update(pass).digest('base64');
    }

    callback(pass, generatedPass);
};

// Выделяет имя пользователя из email
AuthManager.prototype._getUsernameFromEmail = function (email) {
    var atIndex = email.indexOf('@');
    return (atIndex != -1) ? email.substring(0, atIndex) : email;
};

exports.AuthManager = AuthManager;