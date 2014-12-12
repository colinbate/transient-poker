/*globals require: false*/
(function () {
    'use strict';
    require.config({
        paths: {
            'mod'     : 'modules',
            'pubnub'  : '//cdn.pubnub.com/pubnub-3.7.1.min',
            'mithril' : '//cdnjs.cloudflare.com/ajax/libs/mithril/0.1.26/mithril'
        },
        shim: {
            'pubnub'  : { exports: 'PUBNUB' },
            'mithril' : { exports: 'm' }
        },
        waitSeconds: 15
    });

    define('$window', [], function () {
        return window;
    });

    require(['app'], function (app) {
        app.initialize();
    });
}());