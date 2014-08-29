/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'facebook-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
    });
  });

  describe('#update', function(){
    it('should update a user profile', function(){
      var newUser = new User(),
          o       = {twitter:'twitter/newUser.com', visible:'private', phone:'16157726733'};

      newUser.save(o, function(err, user){
        expect(newUser.isVisible).to.be.false;
        expect(newUser.twitter).to.equal('twitter/newUser.com');
        expect(newUser.phone).to.equal('16157726733');
      });
    });
  });

  describe('find', function(){
    it('should find all public users', function(){
      User.find({isVisible:true}, function(err, users){
        expect(users).to.have.length(3);
      });
    });
  });

  describe('#send', function(){
    it('should send a text message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000002', function(err, receiver){
          sender.send(receiver, {mtype:'text', message:'yo'}, function(err, response){
            expect(response.sid).to.be.ok;
            done();
          });
        });
      });
    });

    it('should send an email to a user', function(done){
      User.findById('000000000000000000000002', function(err, sender){
        User.findById('000000000000000000000001', function(err, receiver){
          sender.send(receiver, {mtype:'email', message:'Unit testing a success!'}, function(err, response){
            expect(response.sid).to.be.ok;
            done();
          });
        });
      });
    });
  });

});

