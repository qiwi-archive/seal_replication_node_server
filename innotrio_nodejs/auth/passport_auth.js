/**
 * Created with JetBrains WebStorm.
 * User: Oleg
 * Date: 10.07.13
 * Time: 17:33
 * To change this template use File | Settings | File Templates.
 */

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Response = require('../response/response').Response,
    Command = require('../command/command').Command;

var PassportAuth = function(authRouter, siteConfig) {
    this.passport = passport;
    this.passport.passport_auth = this;
    this.authRouter = authRouter;
    this.siteConfig = siteConfig;
};

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(info, done) {
    done(null, info);
});

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    },
    function(username, password, done) {
        var self = passport.passport_auth;
        var params = {email: username, pass: password};
        self.authRouter._doRoute('auth', self._createCommand(params, null, function(command) {
            var user = command.result;
            return done(null, user);
        }, function(command, errorCode) {
            return done(null, false, errorCode);
        }));
    }
));

PassportAuth.prototype.authLocal = function(req, res, next) {
    var response = new Response(res);
    passport.authenticate('local', function(err, user, info) {
        if (user) {
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return response.sendResult({id_user:user.id, user_role:user.role});
            });
        } else {
            response.sendError(info, null, true);
        }
    })(req, res, next);
};

PassportAuth.prototype.regLocal = function(req, res, next) {
    var self = this;
    this.authRouter._doRoute('reg', self._createCommand(req.query, res, function(command) {
        var user = command.result;
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return self._sendResult(command, {id_user:user.id, user_role:user.role});
        });
    }, this._sendError));
};

/** Проверка, что пользователь авторизован */
PassportAuth.prototype.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        req.query.id_user   = req.user.id;
        req.query.user_role = req.user.role;
        return next();
    }
    return (new Response(res)).sendError('SESSION_ERROR', null, true);
};

PassportAuth.prototype.resetPass = function(req, res, next) {
    var self = this;
    this.authRouter._doRoute('reset_pass', self._createCommand(req.query, res, function(command) {
        var user = command.result;
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect(self.siteConfig.root + self.siteConfig.defaultPage + '?resetpass=1');
        });
    }, function(command,errorCode) {
        res.redirect(self.siteConfig.root + self.siteConfig.loginPage + '?error=' + errorCode);
    }));
};

PassportAuth.prototype._createCommand = function(params, res, resultCb, errorCb) {
    var command = new Command();
    command.done(resultCb);
    command.error(errorCb);
    command.response = res;
    command.params = params;
    return command;
};

PassportAuth.prototype._sendResult = function(command,result) {
    command.response.json({ status:'done', result:result });
    command.clean();
};

PassportAuth.prototype._sendError = function(command,errorCode) {
    command.response.json({ status:'error', message:errorCode });
    command.clean();
};

exports.PassportAuth = PassportAuth;