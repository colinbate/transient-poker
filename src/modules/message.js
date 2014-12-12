define(['pubnub', 'mod/event'], function (PubNub, ev) {
  'use strict';
  var sender, myid, pubnub, channel;
  
  var publisherFactory = function (name) {
    return function (payload) {
      if (typeof payload === 'object' && payload !== null) {
        payload.$name = name;
      } else if (payload !== undefined) {
        payload = {
          $name: name,
          value: payload
        };
      } else {
        payload = {
          $name: name
        };
      }
      sender(payload);
    };
  };

  var subscribers = {
    join: ev.createBroker(),
    hail: ev.createBroker(),
    status: ev.createBroker(),
    leave: ev.createBroker(),
    ready: ev.createBroker(),
    vote: ev.createBroker(),
    reset: ev.createBroker(),
    kick: ev.createBroker()
  };

  var publishers = {
    join: publisherFactory('join'),
    hail: publisherFactory('hail'),
    status: publisherFactory('status'),
    ready: publisherFactory('ready'),
    vote: publisherFactory('vote'),
    reset: publisherFactory('reset'),
    leave: publisherFactory('leave'),
    kick: publisherFactory('kick')
  };

  var message = {
    on: subscribers,
    send: publishers,
    init: function () {
      var uid = PubNub.uuid();
      myid = uid;
      pubnub = PubNub.init({
        uuid: uid,
        subscribe_key: 'sub-c-e95e35d4-7e3a-11e4-9173-02ee2ddab7fe',
        publish_key: 'pub-c-c71b2ba8-6ed9-407b-bcbe-a2f93856d538'
      });
    },
    signout: function () {
      if (pubnub && channel) {
        pubnub.unsubscribe({
          channel: channel
        });
        channel = void 0;
      }
    },
    signin: function (room) {
      var isReady = false,
          outbox = [],
          flush = function () {
            while (outbox.length) {
              sender(outbox.shift());
            }
          };
      if (!pubnub) {
        message.init();
      }
      channel = room;
      pubnub.subscribe({
        channel: room,
        message: function (msg) {
          window.console.log('msg', msg);
          if (msg && msg.$name) {
            if (msg.$sender && msg.$sender === myid) {
              msg.$mine = true;
            }
            subscribers[msg.$name].notify(msg);
          }
        },
        connect: function () {
          isReady = true;
          flush();
        }
      });
      sender = function send(msg, retry) {
        if (!isReady && !retry) {
          outbox.push(msg);
          return;
        }
        isReady = false;
        if (myid && !msg.$sender) {
          msg.$sender = myid;
        }
        pubnub.publish({
          channel: room,
          message: msg,
          callback: function (res) {
            if (res[0] === 1 || retry) {
              isReady = true;
              flush();
            } else {
              send(msg, true);
            }
          }
        });
      };
      return myid;
    }
  };

  return message;
});