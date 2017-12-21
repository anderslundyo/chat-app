// Created by christian on 5/7/2017.

const Expect = require('chai').expect;
const User = require('../models/user');

describe('user', function () {
    it('should be invalid if any field is left empty', function (done) {
        const u = User();

        u.validate(function (err) {
            Expect(err.errors.name).to.exist;
            Expect(err.errors.email).to.exist;
            Expect(err.errors.username).to.exist;
            Expect(err.errors.password).to.exist;
            done();
        })
    })
})