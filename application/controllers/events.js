module.exports = controller('events')
    .actionGet('replicate_errors', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            days: data.days,
            isForce: data.isForce
        };
        models.EventsErrors.replicate(params, function (err) {});
    }).actionGet('replicate_errors_5_minutes', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            days: data.days,
            isForce: data.isForce,
            isMinutes: true
        };
        models.EventsErrors.replicate(params, function (err) {});
    });