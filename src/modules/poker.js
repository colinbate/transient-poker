define(['mithril', 'mod/room'], function (m, room) {
  'use strict';
  var poker = {};
  poker.view = function () {
    return  m('div', room.roomClass(), [
              m('header', room.headerClass(), [
                m('a[href=""].done', {onclick: room.toggleEdit}, [
                  m('span.manage', 'Manage Users'),
                  m('span.d', 'Done')
                ]),
                m('div.title', ['Planning Poker', m('span.room-name', ' (' + room.title() + ')')]),
              ]),
              m('section.entry', room.entryStyle(), [
                m('input[placeholder="Enter a name..."]', {onchange: m.withAttr('value', room.myName), value: room.myName()}),
                m('div', [
                  m('button.pure-button', {disabled: !!room.joinStatus(), onclick: room.join}, 'Participate'),
                  m('button.pure-button', {disabled: !!room.joinStatus(), onclick: room.join.bind(room, {observer: true})}, 'Observe')
                ]),
                m('div.status-msg', room.joinStatus())
              ]),
              m('section.users', room.users.map(function (user) {
                return m('div.user.pure-g', {id: user.id(), 'class': (user.observer() ? 'observer' : 'normal')}, [
                  m('div.pure-u-3-4.name', [
                    m('i.fa.fa-eye'),
                    m('a[href=""]', {onclick: room.toggleObs.bind(room, user)}, user.name())
                  ]),
                  m('div.pure-u-1-4.status', [
                    m('i.fa.fa-check', room.showUserReady(user)),
                    m('span.choice', room.show(user.hasVoted()), user.vote())
                  ]),
                  m('div.pure-u-1-4.delete', [
                    m('button.pure-button', {onclick: room.kick.bind(room, user)}, user.id() === room.myid() ? 'Quit' : 'Evict')
                  ])
                ]);
              })),
              m('section.vote.pure-g', room.voteStyle(), room.cards.map(function (val) {
                return  m('div.pure-u-1-4.btn-wrap', [
                          m('button.pure-button', {onclick: room.vote.bind(room, val)}, '' + val)
                        ]);
              })),
              m('section.commands', room.commandStyle(), [
                m('div', [
                  m('button.pure-button', {onclick: room.reset}, 'Clear')
                ])
              ])
            ]);

  };
  poker.controller = function () {
    room.init();
  };
  return poker;
});