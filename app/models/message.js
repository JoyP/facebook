'use strict';

function Message(o){
  this.fromId   = o.fromId;
  this.toId     = o.toId;
  this.dateSent = new Date();
  this.body     = o.body;
}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.find = function(filter, cb){
  Message.collection.find(filter).toArray(cb);
};

module.exports = Message;
