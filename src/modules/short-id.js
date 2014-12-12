define(['$window'], function (w) {
  'use strict';
  var charset = 'abcdefghijkmnpqrstuvwxyz-ABCDEFGHJKLMNPQRSTUVWXYZ_23456789',
      clen = charset.length,
      rand = function () {
        try {
          var a = new Uint32Array(1);
          w.crypto.getRandomValues(a);
          return (a[0] & 2147483647) / 2147483647; //jshint ignore:line
        } catch (e) {
          return Math.random();
        }
      },
      randChar = function () {
        var r = rand() * clen;
        return charset.charAt(r);
      },
      id = {
        get: function (len) {
          var out = '';
          while (len) {
            out += randChar();
            len -= 1;
          }
          return out;
        }
      };

  return id;
});