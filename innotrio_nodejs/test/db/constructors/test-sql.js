suite('SqlConstructor', function () {
    var SqlConstructor = require('../../../db/classes/constructors/sql');

    suite('#select()', function () {
        test('should constructor simple select query', function () {
            var table = 'users';

            var obj = {
                id_user: 1,
                user_name: 'some_name',
                user_password: '1234567',
                user_column: 'column'
            };

            var expected = 'SELECT * FROM users WHERE id_user=1 AND user_name=\'some_name\' AND user_password=\'1234567\' AND user_column=\'column\';';

            var constructor = new SqlConstructor(table);
            constructor.select(obj).should.be.equal(expected);
        });
    });
    suite('#insert()', function () {
        test('should construct simple insert query', function () {
            var table = 'users';

            var obj = {
                id_user: 1,
                user_name: 'some_name',
                user_password: '1234567',
                user_column: 'column'
            };

            var expected = 'INSERT INTO users(id_user,user_name,user_password,user_column) VALUES(1,\'some_name\',\'1234567\',\'column\');'

            var constructor = new SqlConstructor(table);
            constructor.insert(obj).should.be.equal(expected);
        });
        test('should construct multi insert query', function () {
            var table = 'users';

            var obj = [
                {
                    id_user: 1,
                    user_name: 'some_name',
                    user_password: '1234567',
                    user_column: 'column'
                },
                {
                    id_user: 2,
                    user_name: 'some_name',
                    user_password: '1234567',
                    user_column: 'column'
                }
            ];

            var expected = 'INSERT INTO users(id_user,user_name,user_password,user_column) VALUES(1,\'some_name\',\'1234567\',\'column\'),(2,\'some_name\',\'1234567\',\'column\');'

            var constructor = new SqlConstructor(table);
            constructor.insert(obj).should.be.equal(expected);
        });
    });
    suite('#delete()', function () {
        test('should construct simple delete query', function () {
            var table = 'users';

            var obj = {
                id_user: 1,
                user_name: 'some_name',
                user_password: '1234567',
                user_column: 'column'
            };

            var expected = 'DELETE FROM users WHERE id_user=1 AND user_name=\'some_name\' AND user_password=\'1234567\' AND user_column=\'column\';';

            var constructor = new SqlConstructor(table);
            constructor.delete(obj).should.be.equal(expected);
        });

        test('should construct delete query for array', function () {
            var table = 'users';

            var obj = [
                {
                    id_user: 1,
                    user_name: 'some_name',
                    user_password: '1234567',
                    user_column: 'column'
                },
                {
                    id_user: 2,
                    user_name: 'some_name',
                    user_password: '1234567',
                    user_column: 'column'
                }
            ];

            var expected = 'DELETE FROM users WHERE (id_user=1 AND user_name=\'some_name\' AND user_password=\'1234567\' AND user_column=\'column\') OR (id_user=2 AND user_name=\'some_name\' AND user_password=\'1234567\' AND user_column=\'column\');';

            var constructor = new SqlConstructor(table);
            constructor.delete(obj).should.be.equal(expected);
        });
    });

    suite('#update()', function () {
        test('should construct update query for a single row', function () {
            var table = 'users';

            var obj = {
                set: {
                    user_name: 'some_name'
                },
                where: {
                    id_user: 1
                }
            }

            var expected = 'UPDATE users SET user_name=\'some_name\' WHERE id_user=1';
            var constructor = new SqlConstructor(table);
            constructor.update(obj).should.be.equal(expected);
        });
    });

    suite('SQL injection', function () {
        test('should escape injection', function () {
            var table = 'users';
            var obj = {
                set: {
                    user_name: 'some_name'
                },
                where: {
                    id_user:"anything' OR 'x'='x"
                }
            }
            var expected = "UPDATE users SET user_name='some_name' WHERE id_user='anything\\' OR \\'x\\'=\\'x'";
            var constructor = new SqlConstructor(table);
            constructor.update(obj).should.be.equal(expected);
        });

        test('should escape injection with comment', function () {
            var table = 'users';
            var obj = {
                set: {
                    user_name: 'some_name'
                },
                where: {
                    id_user:"x' AND email IS NULL; --"
                }
            }
            var expected = "UPDATE users SET user_name='some_name' WHERE id_user='x\\' AND email IS NULL; --'";
            var constructor = new SqlConstructor(table);
            constructor.update(obj).should.be.equal(expected);
        });
    });
});