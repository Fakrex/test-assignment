define([
    'angular',
    'app.taskDetail/taskDetail.controller',
    'app.taskDetail/taskDetail.service',
    'app.taskDetail/taskDetailMessages.constant',
    'app.taskDetail/taskDetailNotify.constant',
    'xeditable.config/xeditable.custom',
    'xeditable',
    'angularBootstrapTpls',
    'angularBootstrap'
], function (ng, taskDetailController, taskDetailService, taskDetailMessagesConst, taskDetailNotifyConst, xeditableConfig) {
    var taskDetailModule = ng.module('app.taskDetail', ['xeditable', 'ui.bootstrap', 'ui.bootstrap.tpls']);

    taskDetailModule.run(xeditableConfig);
    taskDetailModule.constant('TASK_DETAIL_NOTIFY', taskDetailNotifyConst);
    taskDetailModule.constant('TASK_DETAIL_MESSAGE', taskDetailMessagesConst);
    taskDetailModule.controller('TaskDetailController', taskDetailController);
    taskDetailModule.factory('TaskDetailService', taskDetailService);

    return taskDetailModule;
});