define([
    'angular',
    'app.taskDetail/taskDetail.controller',
    'app.taskDetail/taskDetail.service',
    'app.taskDetail/taskDetailMessages.constant',
    'xeditable'
], function (ng, taskDetailController, taskDetailService, taskDetailMessagesConst) {
    var taskDetailModule = ng.module('app.taskDetail', ['xeditable']);

    taskDetailModule.run(function(editableOptions) {
        editableOptions.theme = 'default';
    });
    taskDetailModule.constant('TASK_DETAIL_MESSAGE', taskDetailMessagesConst);
    taskDetailModule.controller('TaskDetailController', taskDetailController);
    taskDetailModule.factory('TaskDetailService', taskDetailService);

    return taskDetailModule;
});