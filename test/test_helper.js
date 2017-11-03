var expect = require('chai').expect,
    mocha = require('mocha'),
    helper = require('../helper');

describe('This is test case for helper function', function(){
    var isNumeric,
        getTodoName,
        getTodoNameWithLowerCase,
        createJSONFormat;

    before(function(done){
        isNumeric = helper.isNumeric;
        getTodoName = helper.getTodoName;
        getTodoNameWithLowerCase = helper.getTodoNameWithLowerCase;
        createJSONFormat = helper.createJSONFormat;
        done();
    });

    it('isNumeric method with number', function(done) {
        expect(isNumeric(5)).to.equal(true);
        done();
    });

    it('isNumeric method with string', function(done){
        expect(isNumeric('sad')).to.equal(false);
        expect(isNumeric('')).to.equal(false);
        done();
    });

    it('getTodoName method with command', function(done) {
        expect(getTodoName('/add item')).to.equal(' item');
        done();
    });

    it('getTodoName method with no command', function(done) {
        expect(getTodoName('item')).to.equal('item');
        done();
    });

    it('getTodoNameWithLowerCase with command', function(done) {
        expect(getTodoNameWithLowerCase('/add ITEM')).to.equal(' item');
        done();
    });

    it('getTodoNameWithLowerCase with no command', function(done) {
        expect(getTodoNameWithLowerCase('ITEM')).to.equal('item');
        done();
    });

    it('createJSONFormat', function(done) {
        var json = createJSONFormat('item');
        expect(json.todo).to.equal('item');
        expect(json.completed).to.equal('no');
        expect(json.photo_name).to.equal('');
        done();
    });

    after(function(done) {
        done();
    });

});
