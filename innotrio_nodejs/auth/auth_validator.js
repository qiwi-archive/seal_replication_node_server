/**
 * User: g.konnov
 * Date: 02.07.12
 * Time: 17:18
 */

var AuthValidator = function() { };

AuthValidator.prototype.validateRegParams = function(params, callback) {
    var result = (
        	params.email !== undefined
            && String(params.email).match(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/)
        );

    callback(result);
};

AuthValidator.prototype.validateAuthParams = function(params, callback) {
    var result = (
        params.email !== undefined
            && params.pass !== undefined
            && String(params.email).length>1
            && String(params.pass).length>4
        );

    callback(result);
};

AuthValidator.prototype.validateAuthOrRegVKontakteParams = function(params, callback) {
    var result = (params.vkId, params.username, params.photo, params.photo_small);
    callback(result);
};

AuthValidator.prototype.validateUserParams = function(params, callback) {
	var result = (
			params.email !== undefined
			&& String(params.email).length>1
		);

	callback(result);
};

AuthValidator.prototype.validateConfirmParams = function(params, callback) {
    var result = (params.code !== undefined && params.code.length == 36);
    callback(result);
};

AuthValidator.prototype.validateChangePassParams = function(params, callback) {
    var result = (
        params.email !== undefined
        && params.pass !== undefined
        && params.newPass !== undefined);
    callback(result);
};

AuthValidator.prototype.validateResetPassRequestParams = function(params, callback) {
    var result = (params.email !== undefined);
    callback(result);
};

AuthValidator.prototype.validateResetPassParams = function(params, callback) {
    var result = (params.code !== undefined && params.code.length == 36);
    callback(result);
};

exports.AuthValidator = AuthValidator;