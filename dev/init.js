require.config({

    paths: {
        angular: '../vendor/angular',
        domReady: '../vendor/domReady',
        angularRoute: '../vendor/angular-route'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularRoute: ['angular']
    },
    priority: ['angular'],

    deps: ['./app/app.bootstrap']
});