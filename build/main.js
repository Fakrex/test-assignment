
/**
 * @license RequireJS text 2.0.14 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.14',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});

define('text!app.auth/login.html',[],function () { return '<div class="login-view">\r\n    <form id="LoginForm" name="LoginForm" class="login-view__form login-form"\r\n         ng-controller="AuthController" ng-submit="login(credentials)">\r\n        <span class="login-form__message">{{message}}</span>\r\n        <div class="login-form__field field">\r\n            <label for="username">Имя пользователя:</label>\r\n            <input type="text" id="username" class="field__input"\r\n                   ng-model="credentials.username" required maxlength="16">\r\n        </div>\r\n        <div class="login-form__field field">\r\n            <label for="password">Пароль:</label>\r\n            <input type="password" id="password" class="field__input"\r\n                   ng-model="credentials.password" required maxlength="32">\r\n        </div>\r\n\r\n        <button type="submit" class="login-form__submit button--light">Войти</button>\r\n\r\n    </form>\r\n</div>';});

define('text!app.auth/private.html',[],function () { return '<div class="private-app-view app">\r\n    <div class="app__bar app-bar" ng-controller="AuthController">\r\n        <div class="app-bar__auth-section auth-section">\r\n            <p class="auth-section__current-user">{{currentUser.username}}</p>\r\n            <button class="auth-section__exit-btn button--icon" ng-click="logout()"> <i class="fa fa-sign-out"></i></button>\r\n        </div>\r\n    </div>\r\n    <div ui-view class="app__content"></div>\r\n</div>\r\n';});

define('text!app.tasksBoard/tasksBoard.html',[],function () { return '<div class="tasks-board-view tasks-board" ng-controller="TasksBoardController" ng-init="getCurrentUserTasks(currentUser.id)">\r\n    <h1>Мой список задач</h1>\r\n    <div class="tasks-board__keeper tasks-list">\r\n        <span class="tasks-list__messages">{{tasksBoardMessage}}</span>\r\n        <div class="tasks-list__grid-wrapper grid-wrapper" ng-show="gridOptions.data.length">\r\n            <div class="grid-wrapper__actions task-action">\r\n                <button class="task-action__filter-list button--green" ng-click="toggleFiltering()">\r\n                    <i class="fa fa-filter"></i>\r\n                    <span ng-hide="gridOptions.enableFiltering">Использовать фильтры</span>\r\n                    <span ng-show="gridOptions.enableFiltering">Убрать фильтры</span>\r\n                </button>\r\n            </div>\r\n            <div ui-grid="gridOptions" ui-grid-edit ui-grid-row-edit ui-grid-cellNav class="tasks-list__grid"></div>\r\n        </div>\r\n    </div>\r\n</div>';});

define('text!app.taskDetail/taskDetail.html',[],function () { return '<div class="task-detail-view task-detail" ng-controller="TaskDetailController" ng-init="getTask(currentUser.id, taskId)">\r\n    {{taskDetailMessage}}\r\n    <div ng-hide="taskDetailMessage" class="task-detail__field-set task-field-set">\r\n        <h1 editable-text="taskDetail.title">{{taskDetail.title}}</h1>\r\n        <div class="task-field-set__content task-content">\r\n            <table>\r\n                <tr>\r\n                    <td>\r\n                        <span>Статус</span>\r\n                    </td>\r\n                    <td>\r\n                        <span editable-text="taskDetail.state">{{taskDetail.state}}</span>\r\n                    </td>\r\n                </tr>\r\n                <tr>\r\n                    <td>\r\n                        <span>Дата</span>\r\n                    </td>\r\n                    <td>\r\n                        <span>{{taskDetail.date}}</span>\r\n                    </td>\r\n                </tr>\r\n                <tr>\r\n                    <td>\r\n                        <span>Приоритет</span>\r\n                    </td>\r\n                    <td>\r\n                        <span>{{taskDetail.priority}}</span>\r\n                    </td>\r\n                </tr>\r\n                <tr>\r\n                    <td>\r\n                        <span>Запланированное время</span>\r\n                    </td>\r\n                    <td>\r\n                        <span>{{taskDetail.time_estimate}}</span>\r\n                    </td>\r\n                </tr>\r\n                <tr>\r\n                    <td>\r\n                        <span>Затраченное время</span>\r\n                    </td>\r\n                    <td>\r\n                        <span>{{taskDetail.time_elapsed}}</span>\r\n                    </td>\r\n                </tr>\r\n                <tr>\r\n                    <td>\r\n                        <span>Описание</span>\r\n                    </td>\r\n                    <td>\r\n                        <span>{{taskDetail.description}}</span>\r\n                    </td>\r\n                </tr>\r\n            </table>\r\n        </div>\r\n    </div>\r\n\r\n</div>';});

define('app/app.config',[
    "text!app.auth/login.html",
    "text!app.auth/private.html",
    "text!app.tasksBoard/tasksBoard.html",
    "text!app.taskDetail/taskDetail.html"
], function (loginTemplate, privateTemplate, tasksBoardTemplate, taskDetailTemplate) {

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                template: loginTemplate,
                controller: 'AuthController',
                needForAuth: false
            })
            .state('private', {
                abstract: true,
                url: '/privateApp',
                template: privateTemplate,
                controller: 'AuthController',
                needForAuth: true
            })
                .state('private.tasksBoard', {
                    url: '/TasksBoard',
                    template: tasksBoardTemplate,
                    controller: 'TasksBoardController',
                    needForAuth: true
                })
                .state('private.taskDetail', {
                    url: '/taskDetail/:taskId',
                    template: taskDetailTemplate,
                    controller: 'TaskDetailController',
                    needForAuth: true
                });

    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    return config;
});
define('app/app.controller',[

], function() {

    function appController ($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {

        $scope.currentUser = null;
        $scope.isAuthenticated = AuthService.isAuthenticated;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.resetCurrentUser = function () {
            $scope.currentUser = null;
        };

        $scope.$on(AUTH_EVENTS.loginSuccess, function (e) {
            $state.transitionTo('private.tasksBoard');
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function (e) {
            $state.transitionTo('login');
        });

        //Закрытие доступа для не аутентифицированного пользователя
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if (toState.needForAuth && !$scope.isAuthenticated()) {
                    event.preventDefault();
                    $state.transitionTo('login');
                    $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            });

    }

    appController.$inject = ['$rootScope', '$scope', '$state', 'AuthService', 'AUTH_EVENTS'];

    return appController;
});
;define('app.auth/auth.service',[

], function() {

    function authService($http, $q, Session) {
        var authService = {};

        authService.login = function(credentials) {
            var usersArr,
                currentUser;

            // При законченной реализации, наличии backend-a (контроллера для авторизации, возвращающего учётку вошедшего юзера),
            // нет необходимости в deferred объекте, достаточно promise от $http
            var deferred = $q.defer();

            if(credentials.username && credentials.password){
                $http.get('fakeData/users.json', {data: credentials})
                    .then(function(response) {
                        usersArr = response.data.users;

                        // Эта фильтрации тоже будет ненужной
                        usersArr = usersArr.filter(function(userItem) {
                            return (userItem.username === credentials.username && userItem.password === credentials.password);
                        });

                        if (usersArr.length) {
                            currentUser = usersArr[0];
                            Session.create(currentUser.sessionId, currentUser.id);
                            deferred.resolve(currentUser);
                        } else {
                            deferred.reject();
                        }
                    });
            } else {
                deferred.reject();
            }


            return deferred.promise;
        };

        authService.logout = function () {
            var deferred = $q.defer();

            Session.destroy();
            deferred.resolve();

            return deferred.promise;
        };

        authService.isAuthenticated = function () {
            return !!Session.userId;
        };

        return authService;
    }

    authService.$inject = ['$http', '$q', 'Session'];

    return authService;
});
;define('app.auth/session.service',[

], function() {

    function sessionService() {
        this.create = function (sessionId, userId) {
            this.id = sessionId;
            this.userId = userId;
        };

        this.destroy = function () {
            delete this.id;
            delete this.userId;
        };
    }

    return sessionService;
});
;define('app.auth/auth.controller',[

], function () {


    function authController ($scope, $rootScope, AUTH_EVENTS, AUTH_MESSAGES, AuthService) {

        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.message = '';

        $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
                $scope.setCurrentUser(user);
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $scope.message = AUTH_MESSAGES.loginFailed;
                angular.element(document.querySelector('.login-form__message')).addClass('error');
            });
        };

        $scope.logout = function () {
            AuthService.logout().then(function() {
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $scope.resetCurrentUser();
            });
        };

        $scope.$on(AUTH_EVENTS.notAuthenticated, function (e) {
            angular.element(document.querySelector('.login-form__message')).addClass('error');
            $scope.message = AUTH_MESSAGES.isNotAuthorized;
        });

    }


    authController.$inject = ['$scope', '$rootScope', 'AUTH_EVENTS', 'AUTH_MESSAGES', 'AuthService'];

    return authController;

});

;define('app.auth/authEvents.constant',[

], function() {

    var _AUTH_EVENTS = {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated'
    };

    return _AUTH_EVENTS;
});

;define('app.auth/authMessages.constant',[

], function() {

    var _AUTH_MESSAGES = {
        loginFailed: 'Пользователь с таким логин/паролем не зарегистрирован!',
        isNotAuthorized: 'Вы не прошли аутентификацию!'
    };

    return _AUTH_MESSAGES;
});

define('app.auth/auth.module',[
    'angular',
    'app.auth/auth.service',
    'app.auth/session.service',
    'app.auth/auth.controller',
    'app.auth/authEvents.constant',
    'app.auth/authMessages.constant'
], function (ng, authService, sessionService, authController, authEventsConst, authMessagesConst) {
    var authModule = ng.module('app.auth', []);
    authModule.constant('AUTH_EVENTS', authEventsConst);
    authModule.constant('AUTH_MESSAGES', authMessagesConst);
    authModule.factory('AuthService', authService);
    authModule.service('Session', sessionService);
    authModule.controller('AuthController', authController);

    return authModule;
});
define('app.tasksBoard/tasksBoard.controller',[

], function () {

    function tasksBoardController ($scope, TasksBoardService, TASKS_BOARD_MESSAGES, uiGridConstants, GRID_COLUMNS_CONFIG) {

        $scope.tasksBoardMessage = '';
        $scope.gridOptions = {};

        $scope.getCurrentUserTasks = function (userId) {
            TasksBoardService.getUserTasks(userId).then(function(tasksList) {

                if (!tasksList.length) {
                    $scope.tasksBoardMessage = TASKS_BOARD_MESSAGES.tasksListIsEmpty;
                } else {
                    $scope.gridOptions.data = tasksList;
                }

            }, function () {
                $scope.tasksBoardMessage = TASKS_BOARD_MESSAGES.tasksLoadFailed;
            });
        };

        $scope.saveRow = function (rowEntity) {
            $scope.gridApi.rowEdit.setSavePromise( rowEntity, TasksBoardService.updateTask(rowEntity));
        };

        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
        };
        $scope.gridOptions.enableFiltering = false;
        $scope.gridOptions.columnDefs = GRID_COLUMNS_CONFIG;

        $scope.toggleFiltering = function () {
            $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
        };

    }

    tasksBoardController.$inject = ['$scope', 'TasksBoardService', 'TASKS_BOARD_MESSAGES', 'uiGridConstants', 'GRID_COLUMNS_CONFIG'];

    return tasksBoardController;
});
define('app.tasksBoard/tasksBoard.service',[

], function () {

    function tasksBoardService($http, $q) {
        var tasksBoardService = {};

        tasksBoardService.getUserTasks = function (userId) {
            var tasksArr = [],
                currentTasksEntry,
                deferred = $q.defer();

            $http.get('fakeData/allTasks.json').then(function(response) {
                tasksArr = response.data.allTasks;

                currentTasksEntry = tasksArr.filter(function(tasksEntryItem) {
                    return tasksEntryItem.userId === userId;
                });

                currentTasksEntry.length ? deferred.resolve(currentTasksEntry[0].tasks) : deferred.resolve(currentTasksEntry);

            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        };

        tasksBoardService.updateTask = function(taskObj) {
        //    Тут должен быть post/update запрос для обновления задачи
            var dfd = $q.defer();

            alert('Необходим backend-контроллер для сохранения задач!');
            dfd.resolve(taskObj);

            return dfd.promise;
        };


        return tasksBoardService;
    }

    tasksBoardService.$inject = ['$http', '$q'];


    return tasksBoardService;
});
define('app.tasksBoard/tasksBoardMessages.constant',[

], function() {

    var _TASKS_BOARD_MESSAGES = {
        tasksListIsEmpty: 'Ваш список задач пуст',
        tasksLoadFailed: 'Не получилось загрузить задачи'
    };

    return _TASKS_BOARD_MESSAGES;
});
define('app.tasksBoard/tasksBoard.gridColumns.config.constant',[

], function () {

    var _GRID_COLUMNS_CONFIG =  [
        {name: 'id', enableCellEdit: false, visible: false},
        {name: 'title', displayName: 'Название'},
        {name: 'description', displayName: 'Описание', visible: false},
        {name: 'state', displayName: 'Статус' },
        {name: 'date', displayName: 'Дата'},
        {name: 'priority', displayName: 'Приоритет'},
        {name: 'time_estimate', displayName: 'Планируемое время', type: 'number', enableFiltering: false},
        {name: 'time_elapsed', displayName: 'Затраченное время', type: 'number', enableFiltering: false},
        {name: 'entry_actions', displayName: 'Действия', enableFiltering: false, cellTemplate: '<a ui-sref="private.taskDetail({taskId: row.entity.id})">Подробнее</a>'}
    ];

    return _GRID_COLUMNS_CONFIG;

});
define('app.tasksBoard/tasksBoard.module',[
    'angular',
    'app.tasksBoard/tasksBoard.controller',
    'app.tasksBoard/tasksBoard.service',
    'app.tasksBoard/tasksBoardMessages.constant',
    'app.tasksBoard/tasksBoard.gridColumns.config.constant',
    'angularUiGrid'
], function (ng, tasksBoardController, tasksBoardService, tasksBoardMessagesConst, gridColumnsConfigConst) {
    var tasksBoardModule = ng.module('app.tasksBoard', ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav' ]);

    tasksBoardModule.constant('GRID_COLUMNS_CONFIG', gridColumnsConfigConst);
    tasksBoardModule.constant('TASKS_BOARD_MESSAGES', tasksBoardMessagesConst);
    tasksBoardModule.controller('TasksBoardController', tasksBoardController);
    tasksBoardModule.factory('TasksBoardService', tasksBoardService);

    return tasksBoardModule;
});
define('app.taskDetail/taskDetail.controller',[

], function () {

    function taskDetailController ($scope, TaskDetailService, $stateParams, TASK_DETAIL_MESSAGE) {

        $scope.taskDetailMessage = '';
        $scope.taskDetail = {};
        $scope.taskId = $stateParams.taskId;

        $scope.getTask = function (userId, taskId) {
            TaskDetailService.getTaskDetail(userId, taskId).then(function (taskDetail) {
                $scope.taskDetail = taskDetail;
            }, function () {
                $scope.taskDetailMessage = TASK_DETAIL_MESSAGE.taskIsNotExist;
            });
        };

        $scope.saveTask = function (taskId) {

        };
    }

    taskDetailController.$inject = ['$scope', 'TaskDetailService', '$stateParams', 'TASK_DETAIL_MESSAGE'];

    return taskDetailController;

});
define('app.taskDetail/taskDetail.service',[

], function () {

    function taskDetailService ($http, $q) {
        var taskDetailService = {};

        taskDetailService.getTaskDetail = function (userId, taskId) {
            var tasksArr = [],
                userTasksList = [],
                currentTask,
                deferred = $q.defer();

            $http.get('fakeData/allTasks.json').then(function (response) {
                tasksArr = response.data.allTasks;

                userTasksList = tasksArr.filter(function (tasksEntryItem) {
                    return tasksEntryItem.userId === userId;
                });

                if (!userTasksList.length) {
                    deferred.reject();
                } else {
                    currentTask = userTasksList[0].tasks.filter(function (taskItem) {
                        return taskItem.id === parseInt(taskId);
                    });

                    currentTask.length ? deferred.resolve(currentTask[0]) : deferred.reject();
                }

            }, function() {
                deferred.reject();
            });

            return deferred.promise;

        };

        taskDetailService.updateTaskDetail = function (taskObj) {
            //    Тут должен быть post/update запрос для обновления задачи
            var dfd = $q.defer();

            alert('Необходим backend-контроллер для сохранения задач!');
            dfd.resolve(taskObj);

            return dfd.promise;
        };

        return taskDetailService;
    }

    taskDetailService.$inject = ['$http', '$q'];

    return taskDetailService;
});
define('app.taskDetail/taskDetailMessages.constant',[

], function () {

    var _TASK_DETAIL_MESSAGE = {
        taskIsNotExist: 'Нет данных'
    };

    return _TASK_DETAIL_MESSAGE;
});
define('app.taskDetail/taskDetail.module',[
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
;define('app/app.module',[
    'angular',
    'app/app.config',
    'app/app.controller',
    'app.auth/auth.module',
    'app.tasksBoard/tasksBoard.module',
    'app.taskDetail/taskDetail.module',
    'angularUiRoute'
], function (ng, routeConfig, appController) {

    var app = ng.module('app', ['ui.router', 'app.auth', 'app.tasksBoard', 'app.taskDetail']);
    app.config(routeConfig);
    app.controller('ApplicationController', appController);


    return app;
});
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

define("init", function(){});
