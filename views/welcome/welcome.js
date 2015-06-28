(function() {
    'use strict';
    app.factory('welcome', function($rootScope, coral, devices, constants) {
        var welcome = {
            init: function() {
                $rootScope.values = {
                    isNameSet: false,
                };
            },
            connect: function(name) {
                if (name) {
                    constants.name = name;
                }

                coral.connect(constants, function() {
                    console.log('connected');
                    $rootScope.goToState("devices");
                    devices.init();

                });
            },
        };

        return welcome;

    });

    app.controller('welcomeController', function($scope, welcome) {

        $scope.nameKeyDown = function(event) {
            if (event.keyCode === 13 && $scope.values.name) {
                $scope.values.isNameSet = true;
                welcome.connect($scope.values.name);
            }
        };
    });

})();
