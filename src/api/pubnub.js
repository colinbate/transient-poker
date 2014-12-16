define(['pubnub'], function (PubNub) {
  'use strict';
  var SUB_KEY = 'sub-c-e95e35d4-7e3a-11e4-9173-02ee2ddab7fe',
      PUB_KEY = 'pub-c-c71b2ba8-6ed9-407b-bcbe-a2f93856d538',
      pubnub,
      uid,
      init = function () {
        uid = PubNub.uuid();
        pubnub = PubNub.init({
          uuid: uid,
          subscribe_key: SUB_KEY,
          publish_key: PUB_KEY
        });
      },
      api = {
        subscribe: function (room, handler, cb) {
          if (!pubnub) {
            init();
          }
          pubnub.subscribe({
            channel: room,
            message: handler,
            connect: function () {
              if (cb && typeof cb === 'function') {
                cb.call(null, uid);
              }
            }
          });
        },
        publish: function (room, message, cb) {
          if (!pubnub) {
            init();
          }
          pubnub.publish({
            channel: room,
            message: message,
            callback: function (res) {
              var success = res[0] === 1;
              if (cb) {
                cb.call(null, success);
              }
            }
          });
        },
        unsubscribe: function (room) {
          if (pubnub) {
            pubnub.unsubscribe({
              channel: room
            });
          }
        }
      };
  return api;
});