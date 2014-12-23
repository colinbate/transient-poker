define(['$window'], function (w) {
  'use strict';
  var localStorageAdapter = function (key) {
    return function () {
      var value;
      if (arguments.length) {
        value = arguments[0];
        w.localStorage.setItem(key, value);
        return value;
      }
      return w.localStorage.getItem(key);
    };
  };
  return {
    name: localStorageAdapter('pp-name'),
    room: localStorageAdapter('pp-room')
  };
});