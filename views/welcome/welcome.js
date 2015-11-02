(function() {
    'use strict';
    app.factory('welcome', function($rootScope, coral, constants, connections) {
        var welcome = {
            connect: function(name) {
                if (name) {
                    constants.name = name;
                }

                coral.connect(constants, function() {
                    console.log('connected');
                    $rootScope.goToState("chat");
                    connections.init();
                });
            },
        };

        return welcome;

    });

    app.controller('welcomeController', function($scope, welcome) {

        $scope.values = {
            isNameSet: false,
        };

        $scope.nameKeyDown = function(event) {
            if (event.keyCode === 13 && $scope.values.name) {
                $scope.values.isNameSet = true;
                welcome.connect($scope.values.name);
            }
        };
    });

})();
