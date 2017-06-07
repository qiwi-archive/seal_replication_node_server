module.exports=(function(){
    var Logger=require('./classes/logger');
    return{
        logger: new Logger()
    };
})();