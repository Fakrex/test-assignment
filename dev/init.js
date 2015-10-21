require.config({

    paths: {
        angular: '../vendor/angular',
        domReady: '../vendor/domReady',
        angularUiRoute: '../vendor/angular-ui-router',
        text: '../vendor/text',
        angularUiGrid: '../vendor/ui-grid/ui-grid.min',
        xeditable: '../vendor/xeditable/xeditable'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularUiRoute: {
            exports: 'angularUiRoute',
            deps: ['angular']
        },
        angularUiGrid: {
            exports: 'angularUiGrid',
            deps: ['angular']
        },
        xeditable: {
            exports: 'xeditable',
            deps: ['angular']
        }
    },
    priority: ['angular']

});


require([
    'require',
    'angular',
    'app/app.module'
], function(require, ng, app) {

    require(['domReady!'], function (document) {
        ng.bootstrap(document.getElementById('page'), ['app', 'app.auth']);
    });
});
