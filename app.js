var app = angular.module('app', ['ui.router', 'coral', 'config']);

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
        }).state('devices', {
            controller: "deviceController",
            templateUrl: "views/devices/deviceView.tpl.html"
        });
    });

    app.run( function ($state, welcome, devices) {
        $state.go("welcome");
        welcome.init();
    });

    app.factory('constants', function(config) {
        return {
            networkName: "files",
            className: "filesClient",
            wsUrl: config.coralServer.getWebSocket(),
            debug: config.debug
        };

    });

})();
