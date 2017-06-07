module.exports = {
    //Для работы с методом требуется авторизация
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    //Неверный формат данных
    AUTH_VALIDATION: 'AUTH_VALIDATION',
    //Нет перендан user_id или token
    AUTH_NO_ID_USER_OR_TOKEN: 'AUTH_NO_ID_USER_OR_TOKEN',
    //Неверный токен или id пользователя
    AUTH_WRONG_ID_USER_OR_TOKEN: 'AUTH_WRONG_ID_USER_OR_TOKEN',
    //Не передан id_poll
    AUTH_NO_ID_POLL: 'AUTH_NO_ID_POLL',
    //Требуется другая роль пользователя
    AUTH_WRONG_ROLE: 'AUTH_WRONG_ROLE',
    //Нет данных о таком токене
    AUTH_VERIFICATION_NO_TOKEN: 'AUTH_VERIFICATION_NO_TOKEN',
    //ожидает подтверждения
    TOKEN_NOT_APPROVED: 'TOKEN_NOT_APPROVED',
    //Токен заблокирован
    TOKEN_IS_BLOCKED: 'TOKEN_IS_BLOCKED',
    //Неизвестный статус токена
    TOKEN_INCORRECT_STATUS: 'TOKEN_INCORRECT_STATUS',
    //Ошибка валидации idUser и token
    ERROR_IO_WAITING_USER_AUTH_VALIDATION: 'ERROR_IO_WAITING_USER_AUTH_VALIDATION',
    //Ошибка подключения к обновлению информации об опросе
    ERROR_IO_POLL_VALIDATION: 'ERROR_IO_POLL_VALIDATION',
    //Неверный формат данных для проверки принадлежности
    AUTH_AFFILIATION_VALIDATION: 'AUTH_AFFILIATION_VALIDATION',
    //Попытка взлома
    AUTH_AFFILIATION_POLL_FAKE: 'AUTH_AFFILIATION_POLL_FAKE'
}