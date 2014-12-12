define(['mithril'], function (m) {
  'use strict';
  var hop = Object.prototype.hasOwnProperty,
      orderedBy = function (a, b) {
        if (a.observer() === b.observer()) {
          // Order alphabetically
          if (a.name() === b.name()) {
            return 0;
          }
          return a.name() < b.name() ? -1 : 1;
        }
        // Observers at the bottom.
        return b.observer() ? -1 : 1;
      },
      user = {};

  user.User = function (data) {
    this.id = m.prop(data.id);
    this.name = m.prop(data.name);
    this.observer = m.prop(data.observer || false);
    this.ready = m.prop(data.ready || false);
    this.vote = m.prop(null);
  };
  user.User.prototype.hasVoted = function () {
    return this.vote() !== null;
  };
  user.User.prototype.toJson = function () {
    return {
      id: this.id(),
      name: this.name(),
      observer: this.observer(),
      ready: this.ready()
    };
  };


  user.UserCollection = function () {
    this._users = {};
  };
  user.UserCollection.prototype.add = function (user) {
    if (!this._users[user.id()]) {
      this._users[user.id()] = user;
      // TODO: Trigger async?
    }
  };
  user.UserCollection.prototype.set = function (props) {
    var uid, prop, current;
    if (this._users[props.id]) {
      uid = props.id;
      current = this._users[uid];
      for (prop in props) {
        if (prop !== 'id' && hop.call(props, prop) && current[prop]) {
          current[prop](props[prop]);
        }
      }
    }
  };
  user.UserCollection.prototype.get = function (id) {
    return this._users[id];
  };
  user.UserCollection.prototype.remove = function (user) {
    var removed;
    if (typeof user === 'object') {
      user = user.id();
    }
    if (this._users[user]) {
      removed = this._users[user];
      delete this._users[user];
      return removed;
    }
  };
  user.UserCollection.prototype.reset = function () {
    var u;
    for (u in this._users) {
      if (hop.call(this._users, u)) {
        this._users[u].ready(false);
        this._users[u].vote(null);
      }
    }
  };
  user.UserCollection.prototype.everyoneReady = function () {
    var u;
    for (u in this._users) {
      if (hop.call(this._users, u)) {
        if (!this._users[u].ready() && !this._users[u].observer()) {
          return false;
        }
      }
    }
    return true;
  };
  user.UserCollection.prototype.toArray = function () {
    var u, order = [];
    for (u in this._users) {
      if (hop.call(this._users, u)) {
        order.push(this._users[u]);
      }
    }
    order.sort(orderedBy);
    return order;
  };
  user.UserCollection.prototype.map = function (fn) {
    var ii, orig, newarr = [];
    if (typeof fn !== 'function') {
      return;
    }
    orig = this.toArray();
    for (ii = 0; ii < orig.length; ii += 1) {
      newarr.push(fn.call(null, orig[ii], ii));
    }
    return newarr;
  };


  return user;
});