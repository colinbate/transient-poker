define(['hydna', 'mod/short-id', 'mod/compress-hex'], function (hydna, sid, ch) {
  'use strict';
  // To get the most out of hydna add this to your behaviours:
  // behavior('/{id}', {
  //   open: function (event) {
  //     event.allow(event.connection.id);
  //   },
  //   close: function (event) {
  //     event.channel.emit('{"$name":"leave","$sender":"' + event.connection.id + '","$c":"$sender"}');
  //   }
  // });
  var CHANNEL_PREFIX = 'planningpoker.hydna.net/',
      chans = {},
      init = function (room, cb) {
        if (!chans[room]) {
          chans[room] = new hydna.Channel(CHANNEL_PREFIX + room, 'rw');
          chans[room].onopen = function (ev) {
            chans[room].clientId = ev.data ? ch.shrink(ev.data) : sid.get(22);
            if (cb) {
              cb.call(null, false, chans[room]);
            }
          };
        } else {
          if (cb) {
            cb.call(null, false, chans[room]);
          }
        }
      },
      api = {
        subscribe: function (room, handler, cb) {
          var dataHandler = function (ev) {
            var j = JSON.parse(ev.data);
            if (j.$c) {
              j[j.$c] = ch.shrink(j[j.$c]);
              delete j.$c;
            }
            handler.call(null, j);
          };
          init(room, function (error, chan) {
            if (error) {
              window.console.error(error);
            }
            chan.onmessage = dataHandler;
            chan.onsignal = dataHandler;
            if (cb && typeof cb === 'function') {
              cb.call(null, chan.clientId);
            }
          });
        },
        publish: function (room, message, cb) {
          init(room, function (error, chan) {
            if (error) {
              window.console.error(error);
            }
            chan.send(JSON.stringify(message));
            if (cb && typeof cb === 'function') {
              setTimeout(function () {
                cb.call(null, true);
              });
            }
          });
        },
        unsubscribe: function (room) {
          if (chans[room]) {
            chans[room].close();
            delete chans[room];
          }
        }
      };
  return api;
});