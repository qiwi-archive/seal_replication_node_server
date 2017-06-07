suite('Validator', function () {
    var Validator = require('../validator/classes/validator');

    test('#isInt()', function () {
        var validator = new Validator(3);
        validator.isInt().return().should.be.equal(3);
    });


    suite('#escape()', function () {

        test('xss', function () {
            var validator = new Validator('<div></div>');
            validator.escape().should.be.equal('&lt;div&gt;&lt;/div&gt;');
        });

        test('undefined', function () {
            var validator = new Validator(undefined);
            validator.escape().should.be.equal('');
        });
    })

    suite('#length()', function () {
        test('min', function () {
            var validator = new Validator('word');
            validator.hasLength(4).return().should.be.equal('word');
        });

        test('min failture', function () {
            var validator = new Validator('word');
            var err;
            try {
                validator.hasLength(5).return()
            } catch (_err) {
                err = _err;
            }
            err.should.be.equal('WRONG_LENGTH');
        });

        test('min and max', function () {
            var validator = new Validator('word');
            validator.hasLength(2, 4).return().should.be.equal('word');
        });

        test('max failture', function () {
            var validator = new Validator('word');
            var err;
            try {
                validator.hasLength(0, 3).return()
            } catch (_err) {
                err = _err;
            }
            err.should.be.equal('WRONG_LENGTH');
        });

        test('with undefined', function () {
            var validator = new Validator(undefined);
            validator.hasLength(0).escape().should.be.equal('');
        })

        test('with boolean', function () {
            var validator = new Validator(true);
            validator.hasLength(4).escape().should.be.equal('true');
        })

        test('with integer', function () {
            var validator = new Validator(2014);
            validator.hasLength(4).return().should.be.equal(2014);
        })
    });

    suite('#ifExists()', function () {
        test('exists', function () {
            var validator = new Validator(3);
            validator.ifExists().isInt().return().should.be.equal(3);
        });

        test('not exists', function () {
            var validator = new Validator(null);
            (validator.ifExists().isInt().return() === null).should.be.true;
        });
    });

    suite('#forArray()', function () {
        test('#isInt()', function () {
            var validator = new Validator([1, 2, 3, 4, 5]);
            validator.forArray().isInt().return().should.eql([1, 2, 3, 4, 5]);
        });

        test('#escape()', function () {
            var validator = new Validator(['<div></div>', '<div></div>']);
            validator.forArray().escape().should.eql(['&lt;div&gt;&lt;/div&gt;', '&lt;div&gt;&lt;/div&gt;']);
        });

        test('#isInt() error', function () {
            var validator = new Validator([1, 2, 3, 4, 'A']);
            var err;
            try {
                validator.forArray().isInt().return();
            } catch (_err) {
                err = _err;
            }
            err.should.be.equal('NOT_INTEGER');
        });

        test('#ifExists()', function () {
            var validator = new Validator([]);

            validator.forArray().ifExists().isInt().return().toString().should.be.equal('');
        });
    });

    suite('#isObject()', function () {
        test('#escape()', function () {
            var validator = new Validator({property: '<div></div>', property2: '<div></div>'});
            validator.isObject()
                .prop('property').escape().and
                .prop('property2').escape()
                .return().should.eql({property: '&lt;div&gt;&lt;/div&gt;', property2: '&lt;div&gt;&lt;/div&gt;'});
        });

        test('#isInt()', function () {
            var validator = new Validator({property: 1, property2: 2});
            validator.isObject()
                .prop('property').isInt().and
                .prop('property2').isInt().return().should.eql({property: 1, property2: 2});
        });

        test('#ifExists()', function () {
            var validator = new Validator({});

            validator.isObject()
                .prop('property').ifExists().isInt().escape().should.be.equal('');
        });

        test('#exists() error', function () {
            var validator = new Validator({});
            var err;
            try {
                validator.isObject()
                    .prop('property').exists().escape();
            } catch (_err) {
                err = _err;
            }
            err.should.be.equal('REQUIRED');
        });
    });

    suite('#forArray() #isObject()', function () {
        test('#isInt()', function () {
            var validator = new Validator([
                {property: 1, property2: 2},
                {property: 3, property2: 4}
            ]);
            validator.forArray()
                .isObject()
                .prop('property').isInt().and
                .prop('property2').isInt().return()
                .should.eql([
                    {property: 1, property2: 2},
                    {property: 3, property2: 4}
                ]);
        });

        test('#isAbove()', function () {
            var validator = new Validator([
                {property: 2, property2: 3},
                {property: 4, property2: 5}
            ]);
            validator.forArray()
                .isObject()
                .prop('property').isAbove(1).and
                .prop('property2').isAbove(3).return()
                .should.eql([
                    {property: 2, property2: 3},
                    {property: 4, property2: 5}
                ]);
        });

        test('#isAbove() error', function () {
            var validator = new Validator([
                {property: 2, property2: 3},
                {property: 4, property2: 5}
            ]);
            var err;
            try {
                validator.forArray()
                    .isObject()
                    .prop('property').isAbove(5).and
                    .prop('property2').isAbove(5).return();
            } catch (_err) {
                err = _err;
            }

            err.should.be.equal('NOT_ABOVE');

        });

        test('#isLess()', function () {
            var validator = new Validator([
                {property: 1, property2: 2},
                {property: 3, property2: 4}
            ]);
            validator.forArray()
                .isObject()
                .prop('property').isLess(3).and
                .prop('property2').isLess(5).return()
                .should.eql([
                    {property: 1, property2: 2},
                    {property: 3, property2: 4}
                ]);
        });

        test('#isLess() error', function () {
            var validator = new Validator([
                {property: 1, property2: 2},
                {property: 3, property2: 4}
            ]);
            var err;
            try {
                validator.forArray()
                    .isObject()
                    .prop('property').isLess(1).and
                    .prop('property2').isLess(1).return()
                    .should.eql([
                        {property: 1, property2: 2},
                        {property: 3, property2: 4}
                    ]);
            } catch (_err) {
                err = _err;
            }
            err.should.be.equal('NOT_LESS');
        });


        test('#escape()', function () {
            var validator = new Validator([
                {property: '<div></div>', property2: '<div></div>'},
                {property: '<div></div>', property2: '<div></div>'}
            ]);
            validator.forArray()
                .isObject()
                .prop('property').escape()
                .prop('property2').escape()
                .return()
                .should.eql([
                    {property: '&lt;div&gt;&lt;/div&gt;', property2: '&lt;div&gt;&lt;/div&gt;'},
                    {property: '&lt;div&gt;&lt;/div&gt;', property2: '&lt;div&gt;&lt;/div&gt;'}
                ]);
        });

        test('#ifExists()', function () {
            var validator = new Validator([]);

            validator.forArray()
                .isObject()
                .ifExists().prop('property').isInt()
                .return().toString().should.be.equal([].toString());
        });

        test('#exists() error', function () {
            var validator = new Validator([]);
            var err;
            try {
                validator.forArray()
                    .isObject()
                    .prop('property').isInt()
                    .return();
            } catch (_err) {
                err = _err;
            }
            err.should.be.equal('NOT_INTEGER');
        });
    });
});