/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit the profile', function(done){
      request(app)
      .post('/profile')
      .send('visible=private&_method=put&email=new%40new.com&phone=16157726733&photo=bob.jpg&tagline=this+is+me&facebook=facebook%2Fbob&twitter=twitter%2Fbob')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should show the profile page', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err,res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Email');
        done();
      });
    });
  });

  describe('get /users', function(){
    it('should show a list of public users', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('old@new.com');
        expect(res.text).to.include('sue@aol.com');
        expect(res.text).to.not.include('middle@new.com');
        done();
      });
    });
  });

  describe('get /users/:user.email', function(){
    it('should show the profile of a public user', function(done){
      request(app)
      .get('/users/old@new.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('old@new.com');
        done();
      });
    });

    it('should not show the profile of a private user', function(done){
      request(app)
      .get('/users/middle@new.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.text).to.not.include('middle@new.com');
        done();
      });
    });

  });

  describe('post /message/old@new.com', function(){
    it('should send a user a message', function(done){
      request(app)
      .post('/message/000000000000000000000004')
      .set('cookie', cookie)
      .send('mtype=text&message=hey')
      .end(function(err,res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/old@new.com');
        done();
      });
    });
  });
});

