/* jshint node:true, expr:true */
'use strict';

var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
var expect = _chai.expect;

var _index = require('../../lib/index');

describe('index', function() {
    it('should implement methods required by the interface', function() {
        expect(_index).to.have.property('TemplateBuilder').and.to.be.a('function');
        expect(_index).to.have.property('DirInfo').and.to.be.a('function');
        expect(_index).to.have.property('Template').and.to.be.a('function');
        expect(_index).to.have.property('ApiGatewayTemplates').and.to.be.an('object');
    });
});
