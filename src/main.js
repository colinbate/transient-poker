/*globals require: false*/
(function () {
    'use strict';
    require.config({
        paths: {
            'mod'        : 'modules',
            //'pubnub'     : '//cdn.pubnub.com/pubnub-3.7.1.min',
            'mithril'    : '//cdnjs.cloudflare.com/ajax/libs/mithril/0.1.26/mithril',
            //'scaledrone' : 'https://api2.scaledrone.com/assets/scaledrone.min',
            'hydna'      : '//cdn.hydna.com/1/hydna',
            'qrious'     : 'https://cdn.rawgit.com/neocotic/qrious/2.2.0/dist/umd/qrious.min',
            'fastclick'  : '//cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min'
        },
        shim: {
            //'pubnub'     : { exports: 'PUBNUB' },
            'mithril'    : { exports: 'm' },
            //'scaledrone' : { exports: 'ScaleDrone' }
        },
        waitSeconds: 15
    });

    define('$window', [], function () {
        if (!window.location.origin) {
            window.location.origin = window.location.protocol + '//' +
                    window.location.hostname +
                    (window.location.port ? ':' + window.location.port : '');
        }
        return window;
    });

    require(['app', 'fastclick'], function (app, fastclick) {
        app.initialize();
        fastclick.attach(document.body);
    });
}());