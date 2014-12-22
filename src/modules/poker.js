define(['mithril', 'mod/room'], function (m, room) {
  'use strict';
  var poker = {};
  poker.view = function () {
    return  m('div', room.roomClass(), [
              m('header', room.headerClass(), [
                m('a[href=""].done#modeind', {onclick: room.toggleEdit}, [
                  m('span.manage', 'Manage Users'),
                  m('span.d', 'Done')
                ]),
                m('div.title', [
                  'Planning Poker',
                  m('span.room-name', {onclick: room.showQr}, [
                    ' (' + room.title() + ' ',
                    m('i.fa.fa-barcode'),
                    ')'
                  ])
                ]),
              ]),
              m('section.entry', room.entryStyle(), [
                m('input[placeholder="Enter a name..."]', {onkeyup: room.setName, value: room.myName(), config: room.focusMe}),
                m('div', [
                  m('button.pure-button', {disabled: room.noEntry(), onclick: room.join}, 'Participate'),
                  m('button.pure-button', {disabled: room.noEntry(), onclick: room.join.bind(room, {observer: true})}, 'Observe')
                ]),
                m('div.status-msg', room.joinStatus()),
                m('p.info', 'Welcome to Planning Poker. If you are not familiar with it, the idea is quite simple. A group of people vote on the estimated amount of effort to complete a piece of defined work, usually on a software project.'),
                m('p.info', 'Simply enter a name and click a button to either particate in or observe a room. A room requires all particants vote before revealing the results. Observers do not need to vote.'),
                m('p.info.small', 'Once in a room, you can click "Manage Users" in the top right to evict another user or to leave the room yourself. You can also switch any user between participant and observer.'),
                m('p.info.large', 'Once in a room, you can click on a user\'s box to remove them from the room (including yourself). You can also switch any user between participant and observer.'),
                m('p.info.small', 'If you need to change your name without leaving the room, you can do that from the Manage Users mode.'),
                m('p.info.large', 'If you need to change your name without leaving the room, you can do that by clicking on your own name.'),

              ]),
              m('section.users', room.users.map(function (user) {
                return m('div.uwrap', m('div.user.pure-g', {id: user.id(), 'class': room.userClass(user), onclick: room.selectUser.bind(room, user)}, [
                  m('div.pure-u-1-8.obs-status', {onclick: room.toggleObs.bind(room, user)}, [
                    m('i.fa.fa-fw', {'class': (user.observer() ? 'fa-eye' : 'fa-pencil')})
                  ]),
                  m('div.pure-u-3-4.name', [
                    m('span.un', {onclick: room.toggleEdit.bind(room, user.id())}, [m('i.fa.fa-eye'), user.name()]),
                    m('input', {onkeyup: room.setName, onblur: room.blurName, value: room.myName()})
                  ]),
                  m('div.pure-u-1-4.status', [
                    m('i.fa.fa-check', room.showUserReady(user)),
                    m('span.choice', user.vote())
                  ]),
                  m('div.pure-u-1-4.delete', [
                    m('button.pure-button', {onclick: room.kick.bind(room, user)}, user.id() === room.myid() ? 'Quit' : 'Evict')
                  ])
                ]));
              })),
              m('section.vote.pure-g', room.voteStyle(), room.cards.map(function (val) {
                return  m('div.pure-u-1-4.pure-u-md-1-6.pure-u-lg-1-12.btn-wrap', room.picked(val), [
                          m('button.pure-button', {onclick: room.vote.bind(room, val)}, '' + val)
                        ]);
              })),
              m('section.commands', room.commandStyle(), [
                m('div', [
                  m('button.pure-button', {onclick: room.reset}, 'Clear')
                ])
              ]),
              m('section.overlay', {onclick: room.hideQr}, [
                m('div.modal', [
                  m('p', 'Scan the code below to join this room.'),
                  m('div.qr-here', 'Loading...'),
                  m('p', room.url())
                ])
              ])
            ]);

  };
  poker.controller = function () {
    room.init();
  };
  return poker;
});