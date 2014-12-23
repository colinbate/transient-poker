define(['mod/hash', 'mod/local-state'], function (hash, state) {
  'use strict';
  var api = {};

  api.onroomchange = hash.ontitlechange;
  api.name = function () {
    var value;
    if (arguments.length) {
      value = arguments[0];
      hash.setName(value);
      state.name(value);
      return value;
    }
    return state.name() || hash.getName();
  };

  api.room = function () {
    var value;
    if (arguments.length) {
      value = arguments[0];
      hash.setRoom(value);
      state.room(value);
      return value;
    }
    return hash.getRoom(state.room());
  };

  api.url = hash.url;

  api.onroomchange(function (title) {
    state.room(title);
  });

  return api;
});