var globalUsers;

(function() {
    'use strict';

    app.controller('chatController', function($scope, connections) {

        globalUsers = connections.list;
        $scope.users = connections.list;
        $scope.clickOnUser = function(user) {
            var connection = connections.connect(user.id);
            connection.sendFile();
            console.log("clicked on " + user);
        };

    });


})();
