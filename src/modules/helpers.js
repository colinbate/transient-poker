define([], function () {
  'use strict';
  var helper = {},
      slice = Array.prototype.slice;
  function appendClass(exist, add) {
    if (!add) {
      add = '';
    }
    if (!exist) {
      exist = '';
    }
    if (exist && add) {
      exist += ' ';
    }
    return '' + exist + add;
  }
  function partialFourth(fn, fourth) {
    return function (a, b, c) {
      return fn.call(null, a, b, c, fourth);
    };
  }
  function classy(fn, pos, neg, seed) {
    var resolver = function () {
      var args = slice.call(arguments),
          props = (typeof seed === 'function' ? seed.apply(null, args) : ((typeof seed === 'object' && seed) ? seed : {})),
          klass = props['class'],
          toAdd = fn.apply(null, args);
      if (pos !== undefined || neg !== undefined) {
        toAdd = toAdd ? pos : neg;
      }
      klass = appendClass(klass, toAdd);
      props['class'] = klass;
      return props;
    };
    resolver.and = partialFourth(classy, resolver);
    resolver.bare = function () {
      var args = slice.call(arguments),
          obj  = resolver.apply(null, args);
      return obj['class'];
    };
    return resolver;
  }
  helper.classy = classy;


  helper.invoke = function (method) {
    return function () {
      var args = slice.call(arguments),
          obj = args.shift();
      if (method in obj && typeof obj[method] === 'function') {
        return obj[method].apply(obj, args);
      }
    };
  };

  helper.noop = function () {};

  return helper;
});