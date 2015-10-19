require.config({

    paths: {
        angular: '../vendor/angular',
        domReady: '../vendor/domReady',
        angularUIRoute: '../vendor/angular-ui-router',
        text: '../vendor/text'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularUIRoute: ['angular']
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
