define([], function () {
  'use strict';
  var events = {};

  events.createBroker = function () {
    var list = [];
    var broker = function (fn) {
      if (fn && typeof fn === 'function') {
        list.push(fn);
      }
    };
    broker.notify = function () {
      var ii, args = Array.prototype.slice.call(arguments);
      for (ii = 0; ii < list.length; ii += 1) {
        list[ii].apply(null, args);
      }
    };
    return broker;
  };

  return events;
});