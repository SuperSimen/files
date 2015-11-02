var globalUsers;

(function() {
    'use strict';

    app.controller('chatController', function($scope, connections) {

        $scope.users = connections.list;
        $scope.clickOnUser = function(user) {
            var connection = connections.connect(user.id);
            $scope.activeUser = user;
            connection.sendFile();
            console.log("clicked on " + user);
        };

    });


})();
