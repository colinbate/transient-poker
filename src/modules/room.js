define(['mithril', 'mod/user', 'mod/message', '$window', 'mod/short-id'], function (m, user, msg, w, sid) {
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
      getRoom = function () {
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
          str = sid.get(5);
          w.location.hash = str;
        }
        return str;
      },
      getHashName = function () {
        var str = w.location.hash,
            pos = str.indexOf('/');
        if (pos !== -1) {
          str = str.substring(pos + 1);
          return str;
        }
        return '';
      };
  room.init = function () {
    room.myName = m.prop(getHashName());
    room.title = m.prop(getRoom());
    room.cards = [0, '½', 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'];
    room.users = new user.UserCollection();
    room.myid = m.prop(false);
    room.myChoice = m.prop(null);
    room.voted = m.prop(false);
    room.editMode = m.prop(false);
    room.joinStatus = m.prop('');

    room.roomClass = function () {
      return {'class': room.editMode() ? 'edit-mode' : 'run-mode'};
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
        m.redraw();
        msg.signin(room.title(), function (uid) {
          room.myid(uid);
          props.id = room.myid();
          props.name = room.myName();
          newUser = new user.User(props);
          room.users.add(newUser);
          msg.send.join(newUser.toJson());
          room.joinStatus('');
          m.endComputation();
        });
      }
    };

    room.toggleObs = function (user) {
      if (room.editMode()) {
        user.observer(!user.observer());
        msg.send.status({id: user.id(), observer: user.observer()});
      }
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

    room.toggleEdit = function () {
      room.editMode(!room.editMode());
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
        room.users = new user.UserCollection();
        msg.signout();
      } else {
        payload.$sender = payload.target;
        room.handleLeave(payload);
      }
    };

    w.onbeforeunload = function () {
      if (room.myid()) {
        msg.send.leaveSync();
      }
    };

    if ('onhashchange' in w) {
      w.onhashchange = function () {
        var title = getRoom();
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
      };
    }

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