require.config({

    paths: {
        angular: '../vendor/angular',
        domReady: '../vendor/domReady',
        angularUiRoute: '../vendor/angular-ui-router',
        text: '../vendor/text',
        angularUiGrid: '../vendor/ui-grid/ui-grid.min',
        xeditable: '../vendor/xeditable/xeditable',
        angularBootstrap: '../vendor/angular-bootstrap/ui-bootstrap.min',
        angularBootstrapTpls: '../vendor/angular-bootstrap/ui-bootstrap-tpls.min'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularUiRoute: {
            exports: 'angularUiRoute',
            deps: ['angular']
        },
        angularBootstrapTpls : {
            exports: 'angularBootstrapTpls',
            deps: ['angular']
        },
        angularBootstrap: {
            exports: 'angularBootstrap',
            deps: ['angular', 'angularBootstrapTpls']
        },
        angularUiGrid: {
            exports: 'angularUiGrid',
            deps: ['angular']
        },
        xeditable: {
            exports: 'xeditable',
            deps: ['angular', 'angularBootstrap']
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
