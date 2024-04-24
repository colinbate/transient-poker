define([], function () {
  'use strict';
  var tally = {};

  tally.Tally = function () {
    this.votes = {};
    this.most = {count: 0, value: null};
  };

  tally.Tally.prototype.add = function (vote) {
    this.votes[vote] = (this.votes[vote] || 0) + 1;
    if (this.votes[vote] > this.most.count) {
      this.most.count = this.votes[vote];
      this.most.value = vote;
    } else if (this.votes[vote] === this.most.count) {
      this.most.value = null;
    }
  };

  tally.Tally.prototype.clear = function () {
    this.votes = {};
    this.most.count = 0;
    this.most.value = null;
  };

  tally.Tally.prototype.getClass = function (vote) {
    if (vote === null) {
      return 'no-vote';
    }
    if (vote === '?') {
      return 'vote-pass';
    }
    if (vote === '+') {
      return 'vote-toobig';
    }
    if (vote === this.most.value) {
      return 'vote-most';
    }
    return 'vote-none';
  };

  return tally;
});