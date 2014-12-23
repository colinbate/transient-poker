define(['mithril', 'mod/user', 'mod/message', 'mod/entry', 'lib/qr'], function (m, user, msg, entry, qr) {
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
    room.myName = m.prop(entry.name());
    room.title = m.prop(entry.room());
    room.cards = [0, '½', 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'];
    room.users = new user.UserCollection();
    room.myid = m.prop(false);
    room.myChoice = m.prop(null);
    room.voted = m.prop(false);
    room.editMode = m.prop(false);
    room.joinStatus = m.prop('');
    room.selectedUser = m.prop(null);
    room.qr = m.prop(false);
    room.renderQr = m.prop(false);
    room.url = m.prop('');

    room.roomClass = function () {
      var klass = (room.editMode() ? 'edit-mode' : 'run-mode') + ' ' +
                  (room.qr() ? 'show-qr' : 'no-qr');
      return {'class': klass};
    };

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

    room.headerClass = function () {
      var signedin = !!room.myid();
      return !signedin ? {'class': 'game-off'} : {};
    };

    room.entryStyle = function () {
      var show = !(room.myid());
      return show ? {} : {style: {display: 'none'}};
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

    room.voteStyle = function () {
      var signedin = !!room.myid(),
          show = signedin && !room.voted();
      return show ? {} : {style: {display: 'none'}};
    };

    room.commandStyle = function () {
      var show = room.voted();
      return show ? {} : {style: {display: 'none'}};
    };

    room.userClass = function (user) {
      var klass = (user.observer() ? 'observer' : 'normal') + ' ' +
                  (user.id() === room.myid() ? 'is-me' : 'not-me') + ' ' +
                  (user.ready() ? 'is-ready' : 'not-ready') +
                  (user.id() === room.selectedUser() ? ' selected' : '');
      return klass;
    };

    room.showUserReady = function (usr) {
      var ready = usr.ready(),
          notVoted = !usr.hasVoted(),
          show = ready && notVoted;
      return room.show(show);
    };

    room.show = function (val) {
      return val ? {} : {style: {display: 'none'}};
    };

    room.reset = function () {
      msg.send.reset();
      room.handleReset();
    };

    room.focusMe = function (el, init) {
      if (!init) {
        el.focus();
      }
    };
    
    room.join = function (props) {
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

    room.toggleObs = function (user) {
      user.observer(!user.observer());
      msg.send.status({id: user.id(), observer: user.observer()});
    };

    room.kick = function (user) {
      if (user.id() === room.myid()) {
        msg.send.leave();
        room.handleKick({target: room.myid()});
      } else {
        room.handleLeave({$sender: user.id()});
        msg.send.kick({target: user.id()});
      }
    };

    room.vote = function (choice) {
      var me = room.users.get(room.myid());
      if (room.myChoice() === null) {
        room.myChoice(choice);
        me.ready(true);
        me.vote(choice);
        msg.send.ready();
        if (room.users.everyoneReady()) {
          msg.send.vote({choice: choice});
          room.voted(true);
        }
      } else {
        room.myChoice(choice);
        me.vote(choice);
      }
    };

    room.picked = function (val) {
      return {'class': val === room.myChoice() ? 'picked' : ''};
    };

    room.selectUser = function (user) {
      if (user.id() === room.selectedUser()) {
        room.selectedUser(null);
      } else {
        room.selectedUser(user.id());
      }
    };

    room.toggleEdit = function (target) {
      if (target && typeof(target) === 'string' && target !== room.myid()) {
        return;
      }
      room.editMode(!room.editMode());
      if (!room.editMode()) {
        room.updateName();
      } else if (target) {
        target = document.querySelector('.users .is-me input');
        setTimeout(function () {
          target.focus();
        }, 1);
      }
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
        }
      }
    };

    room.handleVote = function (payload) {
      if (room.users.get(payload.$sender)) {
        room.users.get(payload.$sender).vote(payload.choice);
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

    entry.onroomchange(function (title) {
      m.startComputation();
      if (!room.myid()) {
        room.title(title);
      } else if (room.title() !== title) {
        // Leave room
        msg.send.leave();
        room.handleKick({target: room.myid()});
        room.title(title);
      }
      m.endComputation();
    });

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