/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
var expect = _chai.expect;

var _index = require('../../lib/index');

describe('index', function() {
    it('should implement methods required by the interface', function() {
        expect(_index).to.have.property('todo').and.to.be.a('function');
    });

    describe('todo()', function() {
        it('should return true when invoked', function() {
            expect(_index.todo()).to.be.true;
        });
    });
});
