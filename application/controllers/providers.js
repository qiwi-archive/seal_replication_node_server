module.exports = controller('providers')
    .actionGet('replicate', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce};
    }, function (req, data, done) {
        console.log((new Date()).toString() + ' PRV replication start', data.isForce);
        done(null, true);
        models.Providers.replicate(function (err) {
            if (err) {
                console.log((new Date()).toString() + ' ' + err + ' PRV replication FAILED');
                return;
                //return done(err);
            }

            console.log((new Date()).toString() + ' PRV replication end');
        }, data.isForce);
    })
    .actionGet('replicate_qd', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce};
    }, function (req, data, done) {
        console.log((new Date()).toString() + ' QD_PRV replication start');
        done(null, true);
        models.Providersqd.replicate(function (err) {
            if (err) {
                console.log((new Date()).toString() + ' ' + err + ' QD_PRV replication FAILED');
                return;
                //return done(err);
            }

            console.log((new Date()).toString() + ' QD_PRV replication end');
        }, data.isForce);
    });
