define(['mithril', 'mod/poker'], function (m, poker) {
  'use strict';
  return {
    initialize: function () {
      window.console.log('Planning Poker');
      var appElement = document.getElementById('app');
      m.module(appElement, poker);
    }
  };
});