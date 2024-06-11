define(['mithril', 'mod/room'], function (m, room) {
  'use strict';
  var poker = {};
  poker.view = function () {
    return  m('div', room.roomClass(), [
              m('header', [
                m('a[href=""].done#modeind', {onclick: room.toggleEdit()}, [
                  m('span.manage', 'Manage Users'),
                  m('span.d', 'Done')
                ]),
                m('div.title', [
                  m('img.logo', { src: '/favicon.png', alt: 'Icon of cards' }),
                  m('span', 'Planning Poker'),
                  m('span.room-name', {onclick: room.showQr}, [
                    ' (' + room.title() + ')'
                  ])
                ]),
              ]),
              m('section.entry', [
                m('input[placeholder="Enter a name..."]', {onkeyup: room.setName, value: room.myName(), config: room.focusMe}),
                m('div', [
                  m('button.button-30', {disabled: room.noEntry(), onclick: room.join()}, 'Participate'),
                  m('button.button-30', {disabled: room.noEntry(), onclick: room.join({observer: true})}, 'Observe')
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
                return m('div.uwrap', m('div.user.pure-g', {id: user.id(), 'class': room.userClass(user), onclick: room.toggleSelectedUser(user)}, [
                  m('div.pure-u-1-8.obs-status', {onclick: room.toggleObs(user), title: (user.observer() ? 'Start participating' : 'Switch to observing')}, [
                    m('i.fa.fa-fw', {'class': (user.observer() ? 'fa-eye' : 'fa-pencil')})
                  ]),
                  m('div.pure-u-3-4.name', [
                    m('span.un', {onclick: room.toggleEdit(user.id())}, [m('i.fa.fa-eye'), user.name()]),
                    m('input', {onkeyup: room.setName, onblur: room.blurName, value: room.myName()})
                  ]),
                  m('div.pure-u-1-4.status', [
                    m('i.fa.fa-check.ready-indicator'),
                    m('span.choice', user.vote())
                  ]),
                  m('div.pure-u-1-4.delete', [
                    m('button.pure-button', {onclick: room.kick(user)}, user.id() === room.myid() ? 'Quit' : 'Evict')
                  ])
                ]));
              })),
              m('section.vote.pure-g.vote-flex', room.cards.map(function (val, cidx) {
                return  m('div', room.picked(val), [
                  m('button.fun-button', {onclick: room.vote(val)}, '' + val),
                  m('div.shortcut', 'Ctrl-' + (val === '?' ? '?' : cidx))
                ]);
              })),
              m('section.commands', [
                m('div', [
                  m('button.button-30', {onclick: room.reset}, 'Clear')
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