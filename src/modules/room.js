define(['mithril', 'mod/user', 'mod/message', 'mod/entry', 'lib/qr', 'mod/helpers', 'mod/tally'], function (m, user, msg, entry, qr, h, t) {
  'use strict';
  var room = {},
      handlerFactory = function (fn) {
        return function (payload) {
          if (!payload.$mine) {
            m.startComputation();
            fn.call(null, payload);
            m.endComputation();
          }
        };
      },
      isDesktopUi = function () {
        var modeind = document.getElementById('modeind');
        return modeind.offsetWidth === 0;
      };
  room.init = function () {

    // ======== PROPERTIES =================

    room.myName = m.prop(entry.name());
    room.title = m.prop(entry.room());
    room.cards = [0, '½', 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'];
    room.users = new user.UserCollection();
    room.myid = m.prop(false);
    room.myChoice = m.prop(null);
    room.voted = m.prop(false);
    room.tally = new t.Tally();
    room.editMode = m.prop(false);
    room.joinStatus = m.prop('');
    room.selectedUser = m.prop(null);
    room.qr = m.prop(false);
    room.renderQr = m.prop(false);
    room.url = m.prop('');

    // ========= CLASS SETTERS ==============

    room.roomClass = h.classy(room.editMode, 'edit-mode', 'run-mode').
                      and(room.qr, 'show-qr', 'no-qr').
                      and(room.myid, 'in-room', 'in-lobby').
                      and(room.voted, 'have-voted', 'not-voted');

    room.picked = h.classy(function (val) {
      return val === room.myChoice();
    }, 'picked', '');

    room.showQr = function () {
      var qrimg,
          dest,
          url = entry.url();
      if (!room.renderQr()) {
        room.renderQr(true);
        room.url(url);
        qrimg = qr.image({
          size: 10,
          value: url
        });
        dest = document.querySelector('section.overlay .qr-here');
        dest.innerHTML = '';
        dest.appendChild(qrimg);
      }
      room.qr(true);
    };

    room.hideQr = function () {
      room.qr(false);
    };

    room.setName = function (ev) {
      if (ev.which === 13 && isDesktopUi()) {
        room.editMode(false);
        room.updateName();
        return;
      }
      room.myName(ev.target.value);
    };

    room.noEntry = function () {
      return !!room.joinStatus() || !room.myName();
    };

    // room.userClass = function (user) {
    //   var klass = (user.observer() ? 'observer' : 'normal') + ' ' +
    //               (user.id() === room.myid() ? 'is-me' : 'not-me') + ' ' +
    //               (user.ready() ? 'is-ready' : 'not-ready') +
    //               (user.id() === room.selectedUser() ? ' selected' : '');
    //   return klass;
    // };

    room.isMe = function (usr) {
      return usr.id() === room.myid();
    };

    room.isUserSelected = function (usr) {
      return usr.id() === room.selectedUser();
    };

    room.userVoteClass = function (usr) {
      return room.tally.getClass(usr.vote());
    };

    room.userClass = h.classy(h.invoke('observer'), 'observer', 'normal').
                      and(h.invoke('ready'), 'is-ready', 'not-ready').
                      and(room.isMe, 'is-me', 'not-me').
                      and(room.isUserSelected, 'selected', '').
                      and(room.userVoteClass).
                      bare;

    room.focusMe = function (el, init) {
      if (!init) {
        el.focus();
      }
    };

    // ======= USER ACTIONS / UI EVENT HANDLERS ===========
    
    room.join = function (props) {
      return function () {
        var newUser;
        props = props || {};
        if (room.myName() && !room.joinStatus()) {
          m.startComputation();
          room.joinStatus('Joining...');
          entry.name(room.myName());
          m.redraw();
          msg.signin(room.title(), function (uid, err) {
            if (uid) {
              room.myid(uid);
              props.id = room.myid();
              props.name = room.myName();
              newUser = new user.User(props);
              room.users.add(newUser);
              msg.send.join(newUser.toJson());
              room.joinStatus('');
            } else {
              room.joinStatus(err || 'Could not connect');
            }
            m.endComputation();
          });
        }
      };
    };

    room.toggleObs = function (user) {
      return function () {
        user.observer(!user.observer());
        msg.send.status({id: user.id(), observer: user.observer()});
      };
    };

    room.toggleSelectedUser = function (user) {
      return function () {
        if (user.id() === room.selectedUser()) {
          room.selectedUser(null);
        } else {
          room.selectedUser(user.id());
        }
      };
    };

    room.kick = function (user) {
      return function () {
        if (user.id() === room.myid()) {
          msg.send.leave();
          room.handleKick({target: room.myid()});
        } else {
          room.handleLeave({$sender: user.id()});
          msg.send.kick({target: user.id()});
        }
      };
    };

    room.vote = function (choice) {
      return function () {
        var me = room.users.get(room.myid());
        if (room.myChoice() === null) {
          room.myChoice(choice);
          me.ready(true);
          me.vote(choice);
          msg.send.ready();
          if (room.users.everyoneReady()) {
            msg.send.vote({choice: choice});
            room.voted(true);
            room.tally.add(choice);
          }
        } else {
          room.myChoice(choice);
          me.vote(choice);
        }
      };
    };

    room.reset = function () {
      msg.send.reset();
      room.handleReset();
    };

    room.toggleEdit = function (target) {
      var handler = function () {
        var node;
        room.editMode(!room.editMode());
        if (!room.editMode()) {
          room.updateName();
        } else if (target) {
          node = document.querySelector('.users .is-me input');
          setTimeout(function () {
            node.focus();
          }, 1);
        }
      };

      if (target && typeof(target) === 'string' && target !== room.myid()) {
          return h.noop;
      }
      return handler;
    };

    room.blurName = function () {
      if (isDesktopUi()) {
        room.editMode(false);
        room.updateName();
      }
    };

    room.updateName = function () {
      var me = room.users.get(room.myid());
      if (room.myName() !== me.name()) {
        entry.name(room.myName());
        me.name(room.myName());
        msg.send.status({id: me.id(), name: me.name()});
      }
    };

    // ===== STATE CHANGE ===================

    entry.onroomchange(function (title) {
      m.startComputation();
      if (!room.myid()) {
        room.title(title);
        room.renderQr(false);
        room.qr(false);
      } else if (room.title() !== title) {
        // Leave room
        msg.send.leave();
        room.handleKick({target: room.myid()});
        room.title(title);
        room.renderQr(false);
        room.qr(false);
      }
      m.endComputation();
    });


    // ===== PUB/SUB MESSAGE HANDLERS =======

    room.addUser = function (payload) {
      room.users.add(new user.User(payload));
    };

    room.hailOthers = function () {
      var me;
      if (room.myid()) {
        me = room.users.get(room.myid());
        msg.send.hail(me.toJson());
      }
    };

    room.handleReady = function (payload) {
      if (room.users.get(payload.$sender)) {
        room.users.get(payload.$sender).ready(true);
        if (room.users.everyoneReady()) {
          msg.send.vote({choice: room.myChoice()});
          room.voted(true);
          room.tally.add(room.myChoice());
        }
      }
    };

    room.handleVote = function (payload) {
      if (room.users.get(payload.$sender)) {
        room.users.get(payload.$sender).vote(payload.choice);
        room.tally.add(payload.choice);
      }
    };

    room.handleStatus = function (payload) {
      if (!payload.id) {
        payload.id = payload.$sender;
      }
      room.users.set(payload);
    };

    room.handleReset = function () {
      room.users.reset();
      room.myChoice(null);
      room.voted(false);
      room.tally.clear();
    };

    room.handleLeave = function (payload) {
      room.users.remove(payload.$sender);
      if (!room.voted() && room.users.everyoneReady()) {
        msg.send.vote({choice: room.myChoice()});
        room.voted(true);
      }
    };

    room.handleKick = function (payload) {
      if (payload.target === room.myid()) {
        room.myid(false);
        room.handleReset();
        room.editMode(false);
        room.joinStatus('');
        room.users = new user.UserCollection();
        msg.signout();
      } else {
        payload.$sender = payload.target;
        room.handleLeave(payload);
      }
    };

    msg.on.join(handlerFactory(room.addUser));
    msg.on.join(handlerFactory(room.hailOthers));
    msg.on.hail(handlerFactory(room.addUser));
    msg.on.status(handlerFactory(room.handleStatus));
    msg.on.ready(handlerFactory(room.handleReady));
    msg.on.vote(handlerFactory(room.handleVote));
    msg.on.reset(handlerFactory(room.handleReset));
    msg.on.leave(handlerFactory(room.handleLeave));
    msg.on.kick(handlerFactory(room.handleKick));
  };
  return room;
});