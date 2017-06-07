/**
 * @param middlewareData {avatar: true}
 */
module.exports = AuthMiddleware;

/**
 *
 * @param req
 * @param res
 * @param validator
 * @param next
 * @param middlewareData
 * {
 * ifExists:Boolean - флаг опциональности авторизации
 * strict:Boolean - должна быть полная авторизация по id и токену
 * ifExistsStrict:Boolean - флаг опциональности авторизации, но если есть, то условие срабатывает только для полной авторизации
 * avatar:Boolean - флаг необходимости генерации/получения аватара
 * getPollRights:Boolean -  получаем данные о правах на опрос,
 * roles:[Char] - права на действие должны быть в определенном у определенных ролей. Для этого флага всегда ставится strict
 * 'A' - admin, 'U' - подписанный менеджер
 * subscribe - подписывать человека на опрос при этом действии
 * }
 * @returns {*}
 * @constructor
 */
function AuthMiddleware(req, res, validator, cb, middlewareData) {
    cb();
};