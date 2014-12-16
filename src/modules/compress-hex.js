define([], function () {
  'use strict';
  var api = {},
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_',
      handleChunk = function (chunk) {
        var dec = parseInt(chunk, 16),
            upper = dec >> 6, lower = dec & 63; // jshint ignore:line
        if (upper === 0) {
          return charset.charAt(lower);
        }
        return charset.charAt(upper) + charset.charAt(lower);
      };
  api.shrink = function (hexString) {
    var p = 0, result = '';
    while (p < hexString.length) {
      result += handleChunk(hexString.substr(p, 3));
      p += 3;
    }
    return result;
  };

  return api;
});