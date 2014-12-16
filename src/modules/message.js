define(['api/hydna', 'mod/event'], function (api, ev) {
  'use strict';
  var sender, myid, channel;
  
  var publisherFactory = function (name, sync) {
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
      sender(payload, false, sync);
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
    leaveSync: publisherFactory('leave', true),
    kick: publisherFactory('kick')
  };

  var incomingHandler = function (msg) {
    window.console.log('msg', msg);
    if (msg && msg.$name) {
      if (msg.$sender && msg.$sender === myid) {
        msg.$mine = true;
      }
      subscribers[msg.$name].notify(msg);
    }
  };

  var message = {
    on: subscribers,
    send: publishers,
    signout: function () {
      if (channel) {
        api.unsubscribe(channel);
        channel = void 0;
      }
    },
    signin: function (room, cb) {
      var isReady = false,
          outbox = [],
          flush = function () {
            while (outbox.length) {
              sender(outbox.shift());
            }
          };
      channel = room;
      api.subscribe(room, incomingHandler, function (uid) {
        myid = uid;
        if (cb && typeof cb === 'function') {
          cb.call(null, myid);
        }
        isReady = true;
        flush();
      });
      sender = function send(msg, retry, sync) {
        if (!isReady && !retry) {
          outbox.push(msg);
          return;
        }
        isReady = false;
        if (myid && !msg.$sender) {
          msg.$sender = myid;
        }
        api.publish(room, msg, function (res) {
          if (res || retry) {
            isReady = true;
            flush();
          } else {
            send(msg, true);
          }
        }, sync);
      };
    }
  };

  return message;
});