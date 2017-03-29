define(['scaledrone'], function () {
  'use strict';
  var CHANNEL_ID = 'l4AaLoPXD24J0tb5',
      // REST_PREFIX = 'https://api2.scaledrone.com/',
      // getRestUrl = function (roomName) {
      //   return REST_PREFIX + CHANNEL_ID + '/' + roomName + '/publish';
      // },
      drone,
      subs = {},
      init = function (cb) {
        if (!drone) {
          drone = new window.ScaleDrone(CHANNEL_ID);
          drone.on('open', cb);
        } else {
          if (cb) {
            cb.call(null, false);
          }
        }
      },
      api = {
        subscribe: function (room, handler, cb) {
          init(function (error) {
            if (error) {
              window.console.error(error);
            }
            var sub = drone.subscribe(room);
            sub.on('open', function (e) {
                if (e) {
                  window.console.error(e);
                }
                if (cb && typeof cb === 'function') {
                  cb.call(null, drone.clientId);
                }
            });
            sub.on('data', handler);
            subs[room] = sub;
          });
        },
        publish: function (room, message, cb, sync) {
          if (sync) {
            //var res = sj(getRestUrl(room), message);
          }
          // TODO: Handle sync
          init(function (error) {
            if (error) {
              window.console.error(error);
            }
            drone.publish({
              room: room,
              message: message
            });
            if (cb && typeof cb === 'function') {
              setTimeout(function () {
                cb.call(null, true);
              });
            }
          });
        },
        unsubscribe: function (room) {
          if (subs[room]) {
            subs[room].unsubscribe();
          }
        }
      };
  return api;
});