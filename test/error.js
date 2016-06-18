var chai = require("chai");
var sinonChai = require("sinon-chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.use(sinonChai);

var liquid = require('..')(), ctx;

function test(func, cb){
    try{
        func();
        cb({});
    }
    catch(e){
        cb(e);
    }
}

describe('error', function() {

    it('should throw TokenizationError when tag illegal', function() {
        test(function(){
            liquid.render('{% -a %}', {});
        }, function(err){
            expect(err.name).to.equal('TokenizationError');
            expect(err.message).to.equal('illegal tag: {% -a %}');
            expect(err.input).to.equal('{% -a %}');
            expect(err.line).to.equal(1);
        });
    });

    it('should throw correct error info', function() {
        test(function(){
            liquid.render('{%if true%}\naaa{%endif%}\n{% -a %}\n3', {});
        }, function(err){
            expect(err.input).to.equal('{% -a %}');
            expect(err.line).to.equal(3);
        });
    });

    it('should throw ParseError when filter not exist', function() {
        test(function(){
            liquid.render('{{ a | xz }}', {});
        }, function(err){
            expect(err.name).to.equal('ParseError');
            expect(err.message).to.equal('filter "xz" not found');
            expect(err.input).to.equal('{{ a | xz }}');
            expect(err.line).to.equal(1);
        });
    });
    it('should throw ParseError when tag not exist', function() {
        test(function(){
            liquid.render('{% a %}', {});
        }, function(err){
            expect(err.name).to.equal('ParseError');
            expect(err.message).to.equal('tag a not found');
            expect(err.input).to.equal('{% a %}');
            expect(err.line).to.equal(1);
        });
    });

    it('should throw ParseError when tag not closed', function() {
        test(function(){
            liquid.render('{% if %}', {});
        }, function(err){
            expect(err.name).to.equal('ParseError');
            expect(err.message).to.equal('tag {% if %} not closed');
            expect(err.input).to.equal('{% if %}');
            expect(err.line).to.equal(1);
        });
    });

});
