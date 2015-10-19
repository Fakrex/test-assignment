
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

define('text!app.auth/login.html',[],function () { return '<div class="login-view">\r\n    <form id="LoginForm" name="LoginForm" class="login-view__form login-form"\r\n         ng-controller="AuthController" ng-submit="login(credentials)">\r\n        <span class="login-form__message">{{message}}</span>\r\n        <div class="login-form__field field">\r\n            <label for="username">Имя пользователя:</label>\r\n            <input type="text" id="username" class="field__input"\r\n                   ng-model="credentials.username" required maxlength="16">\r\n        </div>\r\n        <div class="login-form__field field">\r\n            <label for="password">Пароль:</label>\r\n            <input type="password" id="password" class="field__input"\r\n                   ng-model="credentials.password" required maxlength="32">\r\n        </div>\r\n\r\n        <button type="submit" class="login-form__submit button">Войти</button>\r\n\r\n    </form>\r\n</div>';});

define('text!app.private/private.html',[],function () { return '<div>\r\n    AppBar\r\n    <button> <i class="fa fa-sign-out"></i></button>\r\n</div>\r\n<div ui-view></div>';});

define('app/app.config',[
    "text!app.auth/login.html",
    "text!app.private/private.html"
], function (loginTemplate, privateTemplate) {

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                template: loginTemplate,
                controller: 'AuthController'
            })
            .state('private', {
                abstract: true,
                url: '/privateApp',
                template: privateTemplate
            })
            .state('private.taskBoard', {
                url: '/TaskBoard',
                template: '<h1>Task board page</h1>'
            });

    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    return config;
});
define('app/app.controller',[

], function() {

    function appController ($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {

        $scope.currentUser = null;
        $scope.isAuthenticated = false;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
            $scope.isAuthenticated = AuthService.isAuthenticated;
        };

        $scope.resetCurrentUser = function () {
            $scope.currentUser = null;
            $scope.isAuthenticated = false;
        };

        $scope.$on(AUTH_EVENTS.loginSuccess, function (e) {
            $state.go('private.taskBoard');
        });

        //Закрытие доступа для не аутентифицированного пользователя
        //$rootScope.$on('$stateChangeStart',
        //    function(event, toState, toParams, fromState, fromParams){
        //        if(!$scope.isAuthenticated && toState.name !== 'login') {
        //            event.preventDefault();
        //            $state.go('login');
        //            $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
        //        }
        //    });

    }

    appController.$inject = ['$rootScope', '$scope', '$state', 'AuthService', 'AUTH_EVENTS'];

    return appController;
});
;define('app.auth/auth.service',[

], function() {

    function authService($http, $q, $filter, Session) {
        var authService = {};

        authService.login = function(credentials) {
            var usersArr,
                currentUser;

            // При законченной реализации, наличии backend-a (контроллера для авторизации),
            // нет необходимости в deferred объекте, достаточно promise от $http
            var deferred = $q.defer();

            if(credentials.username && credentials.password){
                $http.get('fakeData/users.json', {data: credentials})
                    .then(function(response) {
                        usersArr = response.data.users;
                        usersArr = $filter('filter')(usersArr, credentials);

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

    authService.$inject = ['$http', '$q', '$filter', 'Session'];

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
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
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
;define('app/app.module',[
    'angular',
    'app/app.config',
    'app/app.controller',
    'app.auth/auth.module',
    'angularUIRoute'
], function (ng, routeConfig, appController) {

    var app = ng.module('app', ['ui.router']);
    app.config(routeConfig);
    app.controller('ApplicationController', appController);


    return app;
});
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

define("init", function(){});
