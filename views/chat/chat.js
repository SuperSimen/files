var globalUsers;

(function() {
    'use strict';

    app.controller('chatController', function($scope, connections) {

        $scope.users = connections.list;
        $scope.clickOnUser = function(user) {
            connections.connect(user.id);
            $scope.activeUser = user;
            console.log("clicked on " + user);
        };

	$scope.chatKeyDown = function(event) {
            if (event.keyCode === 13) {
                sendMessage();
            }
	};

        $scope.sendFile = function() {
            if ($scope.activeUser) {
                var connection = connections.get($scope.activeUser.id);
                connection.sendFile();
            }
        };

        $scope.isActive = function(id) {
            return ($scope.activeUser && id === $scope.activeUser.id);
        }

        $scope.isMe = function(id) {
            return (id === connections.myId);
        }

        $scope.getUserName = function(id) {
            if (id === connections.myId) {
                return "Me";
            }
            else {
                var name = connections.get(id).name;
                if (name) {
                    return name;
                }
                else {
                    return id;
                } 
            }
        };

        function sendMessage () {
            var to = $scope.activeUser;
            var message = $scope.chatMessage;
            if (message && to) {
                connections.get(to.id).sendMessage(message);
                $scope.chatMessage = "";
            }
        }

    });


})();
