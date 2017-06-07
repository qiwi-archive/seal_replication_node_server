module.exports = controller('sms')
    .actionGet('replicate_5_minutes', function (req, validator) {
        var isForce = (req.query.force || '0') !== '0';
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: true,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_5_minutes_with_extras', function (req, validator) {
        var isForce = (req.query.force || '0') !== '0';
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: true,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_days', function (req, validator) {
        var isForce = (req.query.force || '0') !== '0';
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_days_with_extras', function (req, validator) {
        var isForce = (req.query.force || '0') !== '0';
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_all_days', function (req, validator) {
        var isForce = (req.query.force || '0') !== '0';
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
        params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_all_5_minutes', function (req, validator) {
        var isForce = (req.query.force || '0') !== '0';
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: true,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
        params = {
            isMinutes: true,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        models.Sms.replicate(params, function (err) {
        });
    });