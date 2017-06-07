/**
 * Created with JetBrains WebStorm.
 * User: GEG
 * Date: 27.01.13
 * Time: 0:27
 * To change this template use File | Settings | File Templates.
 */
var crypto = require('crypto');

var AuthKeyValidator = function(appParams) {
    this.apiId=appParams.apiId;
    this.apiSecret=appParams.apiSecret;
};

AuthKeyValidator.prototype.validate = function(authKey, viewerId) {
    if(authKey) {
        if (authKey == this.getAuthKey(viewerId)) {
            return true;
        }
    }
    return false;
};

AuthKeyValidator.prototype.getAuthKey = function(viewerId) {
    return crypto.createHash('md5').update(this.apiId+'_'+viewerId+'_'+this.apiSecret).digest('hex');
};

exports.AuthKeyValidator = AuthKeyValidator;