module.exports = CronTasks;

var CronJob = require('cron').CronJob;

function CronTasks() {

}

CronTasks.prototype.init = function () {
    var self = this;
    console.log((new Date()).toString() + ' CRON started');
    // В 05:02 выгружаем дневные транзакции
    new CronJob({
        cronTime: '00 02 05 * * *',
        onTick: function () {
            self._updateDayTxns();
        },
        start: true
    });
    // В 08:02 выгружаем дневные транзакции QD
    new CronJob({
        cronTime: '00 02 08 * * *',
        onTick: function () {
            self._updateQdDayTxns();
        },
        start: true
    });
    // В 08:30 выгружаем дневные транзакции QW PUSH c экстрами
    new CronJob({
        cronTime: '00 30 08 * * *',
        onTick: function () {
            self._updateQwPushDayTxns(true);
        },
        start: true
    });// В 08:30 выгружаем дневные транзакции QW PUSH
    new CronJob({
        cronTime: '30 30 08 * * *',
        onTick: function () {
            self._updateQwPushDayTxns(false);
        },
        start: true
    });
    // // В 08:40 выгружаем дневные агрегаты ошибок
    // new CronJob({
    //     cronTime: '00 40 08 * * *',
    //     onTick: function () {
    //         self._updateDayErrors(10);
    //     },
    //     start: true
    // });
    // В 08:35 выгружаем провайдеров
    new CronJob({
        cronTime: '00 35 08 * * *',
        onTick: function () {
            self._updateProviders();
        },
        start: true
    });
    // В 08:55 выгружаем qd провайдеров
    new CronJob({
        cronTime: '00 55 08 * * *',
        onTick: function () {
            self._updateQdProviders();
        },
        start: true
    });
    // В 05:02 выгружаем пятиминутные агрегаты по транзакциям с экстрами
    new CronJob({
        cronTime: '00 02 05 * * *',
        onTick: function () {
            self._updateMinuteTxns(0, true);
        },
        start: true
    });
    // В 05:42 выгружаем пятиминутные агрегаты по транзакциям с экстрами
    new CronJob({
        cronTime: '00 42 05 * * *',
        onTick: function () {
            self._updateMinuteTxns(0, false);
        },
        start: true
    });
    // // В 05:55 выгружаем пятиминутные агрегаты по ошибкам
    // new CronJob({
    //     cronTime: '00 55 05 * * *',
    //     onTick: function () {
    //         self._updateMinuteErrors(1);
    //     },
    //     start: true
    // });
    // Каждые 5 минут реплицируем транзакции
    new CronJob({
        cronTime: '10 */5 * * * *',
        onTick: function () {
            self._updateMinuteTxns(1/48, false);
        },
        start: true
    });
    // Каждые 5 минут реплицируем транзакции с экстрами
    new CronJob({
        cronTime: '1 */5 * * * *',
        onTick: function () {
            self._updateMinuteTxns(1/48, true);
        },
        start: true
    }); // Каждые 5 минут со смещением на 4 минуты реплицируем транзакции
    new CronJob({
        cronTime: '10 4-59/5 * * * *',
        onTick: function () {
            self._updateMinuteTxns(1/48, false);
        },
        start: true
    });
    // Каждые 5 минут со смещением на 4 минуты реплицируем транзакции с экстрами
    new CronJob({
        cronTime: '1 4-59/5 * * * *',
        onTick: function () {
            self._updateMinuteTxns(1/48, true);
        },
        start: true
    });
};

CronTasks.prototype._updateProviders = function () {
    console.log((new Date()).toString() + ' PRV replication start');
    models.Providers.replicate(function (err) {
        if (err) {
            console.log((new Date()).toString() + ' PRV replication FAILED');
            return;
        }

        console.log((new Date()).toString() + ' PRV replication end');
    }, true);
};

CronTasks.prototype._updateQdProviders = function () {
    console.log((new Date()).toString() + ' QD_PRV replication start');
    models.Providersqd.replicate(function (err) {
        if (err) {
            console.log((new Date()).toString() + ' QD_PRV replication FAILED');
            return;
        }

        console.log((new Date()).toString() + ' QD_PRV replication end');
    }, true);
};

CronTasks.prototype._updateDayTxns = function () {
    var days = 10;
    var isForce = false;
    var params = {
        isMinutes: false,
        replicateExtras: false,
        days: days,
        isForce: isForce
    };
    models.BillsQwPull4Push.replicate(params,function (err) {});
    models.Bills.replicate(params,function (err) {});
    params = {
        isMinutes: false,
        replicateExtras: true,
        days: days,
        isForce: isForce
    };
    models.BillsQwPull4Push.replicate(params, function (err) {});
    models.Bills.replicate(params, function (err) {});
    params = {
        isMinutes: false,
        replicateExtras: true,
        days: days,
        isForce: isForce,
        equals15k: true
    };
    models.BillsQwPull4Push.replicate(params, function (err) {});
    models.Bills.replicate(params, function (err) {});
    params = {
        isMinutes: false,
        replicateExtras: true,
        days: days,
        isForce: isForce,
        moreThan15k: true
    };
    models.BillsQwPull4Push.replicate(params, function (err) {});
    models.Bills.replicate(params, function (err) {});
};

CronTasks.prototype._updateQwPushDayTxns = function (isForce) {
    var days = 10;
    params = {
        days: days,
        isForce: isForce
    };
    models.TxnsQwPush.replicate(params, function (err) {});
};

CronTasks.prototype._updateQdDayTxns = function () {
    var params = {
        days: 0,
        isForce: false
    };
    models.Txnsqd.replicate(params, function (err) {});
};

CronTasks.prototype._updateMinuteTxns = function (days, replicateExtras) {
    if (configs.replicate_5_txns !== true) {
        return;
    }
    var params = {
        isMinutes: true,
        replicateExtras: replicateExtras,
        days: days,
        isForce: false,
        skipLog: true
    };
    if (days >= 1) {
        models.BillsQwPull4Push.replicate(params, function (err) {});
    }
    models.Bills.replicate(params, function (err) {});
    models.TxnsQwPush.replicate(params, function (err) {});
    models.Sms.replicate(params, function (err) {});
};

CronTasks.prototype._updateDayErrors = function (days) {
    var params = {
        days: days,
        isForce: false
    };
    models.EventsErrors.replicate(params, function (err) {});
};

CronTasks.prototype._updateMinuteErrors = function (days) {
    if (configs.replicate_5_txns !== true) {
        return;
    }
    var params = {
        isMinutes: true,
        days: days,
        isForce: false,
        skipLog: true
    };
    models.EventsErrors.replicate(params, function (err) {});
};