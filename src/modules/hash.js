define(['mod/short-id', '$window', 'mod/event'], function (sid, w, ev) {
  'use strict';
  var hashsuite = {};
  hashsuite.getRoom = function (defaultValue) {
    var str = w.location.hash,
        pos = str.indexOf('/');
    if (str.substring(0, 1) === '#') {
      str = str.substring(1);
    }
    if (pos !== -1) {
      str = str.substring(0, pos);
    }
    str = str.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!str) {
      str = defaultValue || sid.get(5);
      w.location.hash = str;
    }
    return str;
  };
  hashsuite.getName = function () {
    var str = w.location.hash,
        pos = str.indexOf('/');
    if (pos !== -1) {
      str = decodeURIComponent(str.substring(pos + 1));
      return str;
    }
    return '';
  };
  hashsuite.setName = function (name) {
    w.location.hash = hashsuite.getRoom() + '/' + encodeURIComponent(name);
  };
  hashsuite.setRoom = function (room) {
    w.location.hash = room + '/' + encodeURIComponent(hashsuite.getName());
  };
  hashsuite.url = function () {
    return w.location.origin + w.location.pathname + '#' + hashsuite.getRoom();
  };
  hashsuite.ontitlechange = ev.createBroker();

  if ('onhashchange' in w) {
    w.onhashchange = function () {
      var title = hashsuite.getRoom();
      hashsuite.ontitlechange.notify(title);
    };
  }

  return hashsuite;
});