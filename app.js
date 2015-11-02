var app = angular.module('app', ['ui.router', 'coral', 'fileTransfer', 'config']);

(function() {
    'use strict';

    app.controller('appController', function($rootScope, $state) {
        $rootScope.goToState = function(state) {
            $state.go(state);
        }

    });

    app.config( function ( $stateProvider) {
        $stateProvider.state('welcome', {
            controller: "welcomeController",
            templateUrl: "views/welcome/welcomeView.tpl.html"
        }).state('chat', {
            controller: "chatController",
            templateUrl: "views/chat/chatView.tpl.html"
        });
    });

    app.run( function ($state, welcome) {
        welcome.connect();
        $state.go("chat");
    });

    app.factory('constants', function(config) {
        return {
            networkName: "files",
            className: "filesClient",
            wsUrl: config.coralServer.getWebSocket(),
            debug: true
        };

    });

})();
