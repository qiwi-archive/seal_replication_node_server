module.exports = controller('transactions')
    .actionGet('replicate_5_minutes', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        var isPull4Push = false;
        if ((req.query.pull4push || '0') != '0')
            isPull4Push = true;        
        return {isForce: isForce, isPull4Push: isPull4Push, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: true,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        if (data.isPull4Push) {
            models.BillsQwPull4Push.replicate(params, function (err) {
            });
        } else {
            models.Bills.replicate(params, function (err) {
            });
        }
    })
    .actionGet('replicate_5_minutes_with_extras', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        var isPull4Push = false;
        if ((req.query.pull4push || '0') != '0')
            isPull4Push = true;
        return {isForce: isForce, isPull4Push: isPull4Push, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: true,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        if (data.isPull4Push) {
            models.BillsQwPull4Push.replicate(params, function (err) {
            });
        } else {
            models.Bills.replicate(params, function (err) {
            });
        }
    })
    .actionGet('replicate_days', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        var isPull4Push = false;
        if ((req.query.pull4push || '0') != '0')
            isPull4Push = true;
        return {isForce: isForce, isPull4Push: isPull4Push, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        if (data.isPull4Push) {
            models.BillsQwPull4Push.replicate(params, function (err) {
            });
        } else {
            models.Bills.replicate(params, function (err) {
            });
        }
    })
    .actionGet('replicate_qw_push_days', function (req, validator) {
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
        models.TxnsQwPush.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_qw_push_days_extras', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            days: data.days,
            isForce: data.isForce,
            replicateExtras: true
        };
        models.TxnsQwPush.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_qw_push_minutes', function (req, validator) {
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
        models.TxnsQwPush.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_qw_push_minutes_extras', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            days: data.days,
            isForce: data.isForce,
            isMinutes: true,
            replicateExtras: true
        };
        models.TxnsQwPush.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_days_with_extras', function (req, validator) {
                var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        var isPull4Push = false;
        if ((req.query.pull4push || '0') != '0')
            isPull4Push = true;
        return {isForce: isForce, isPull4Push: isPull4Push, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        if (data.isPull4Push) {
            models.BillsQwPull4Push.replicate(params, function (err) {
            });
        } else {
            models.Bills.replicate(params, function (err) {
            });
        }
    })
    .actionGet('replicate_days_with_extras_15k', function (req, validator) {
                var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        var isPull4Push = false;
        if ((req.query.pull4push || '0') != '0')
            isPull4Push = true;
        return {isForce: isForce, isPull4Push: isPull4Push, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce,
            equals15k: true
        };
        if (data.isPull4Push) {
            models.BillsQwPull4Push.replicate(params, function (err) {
            });
        } else {
            models.Bills.replicate(params, function (err) {
            });
        }
    })
    .actionGet('replicate_days_with_extras_15kplus', function (req, validator) {
                var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        var isPull4Push = false;
        if ((req.query.pull4push || '0') != '0')
            isPull4Push = true;
        return {isForce: isForce, isPull4Push: isPull4Push, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce,
            moreThan15k: true
        };
        if (data.isPull4Push) {
            models.BillsQwPull4Push.replicate(params, function (err) {
            });
        } else {
            models.Bills.replicate(params, function (err) {
            });
        }
    })
    .actionGet('replicate_qd_days', function (req, validator) {
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
        models.Txnsqd.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_all_days', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: false,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Bills.replicate(params, function (err) {
        });
        params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Bills.replicate(params, function (err) {
        });
        params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce,
            equals15k: true
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Bills.replicate(params, function (err) {
        });
        params = {
            isMinutes: false,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce,
            moreThan15k: true
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Bills.replicate(params, function (err) {
        });

        params = {
            days: data.days,
            isForce: data.isForce
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Txnsqd.replicate(params, function (err) {
        });

        params = {
            days: data.days,
            isForce: data.isForce
        };
        models.TxnsQwPush.replicate(params, function (err) {
        });
    })
    .actionGet('replicate_all_5_minutes', function (req, validator) {
        var isForce = false;
        if ((req.query.force || '0') != '0')
            isForce = true;
        return {isForce: isForce, days: validator(req.query.days || 0).isInt().return()};
    }, function (req, data, done) {
        done(null, true);
        var params = {
            isMinutes: true,
            replicateExtras: false,
            days: data.days,
            isForce: data.isForce
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Bills.replicate(params, function (err) {
        });
        models.TxnsQwPush.replicate(params, function (err) {
        });
        params = {
            isMinutes: true,
            replicateExtras: true,
            days: data.days,
            isForce: data.isForce
        };
        models.BillsQwPull4Push.replicate(params, function (err) {
        });
        models.Bills.replicate(params, function (err) {
        });
        models.TxnsQwPush.replicate(params, function (err) {
        });
    });