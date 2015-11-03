var globalUsers;

(function() {
    'use strict';

    app.controller('chatController', function($scope, connections, fileList) {

        globalUsers = fileList;
        $scope.users = connections.list;
        $scope.clickOnUser = function(user) {
            var connection = connections.connect(user.id);
            $scope.activeUser = user;
            connections.activeConnection = connection;
            console.log(connections.activeConnection);
            console.log("clicked on " + user);
        };

	$scope.chatKeyDown = function(event) {
            if (event.keyCode === 13) {
                sendMessage();
            }
	};

        $scope.getFile = function(fileId) {
            if (fileId) {
                return fileList.get(fileId);
            }
        };

        $scope.getUnread = function(id) {
            var connection = connections.get(id);
            if (connection) {
                return connection.conversation.unread;
            }
            else {
                return 0;
            }
        };

        $scope.$watch(
            function() {return $scope.activeUser;},
            function(user) {
                console.log(user);
                if (!user) {
                    return;
                }
                var connection = connections.get(user.id);
                $scope.placeholder = "";

                if (connection) {
                    if (!connection.online) {
                        $scope.placeholder = "User is offline";
                    }
                }

            }
        );


        $scope.sendFile = function() {
            if (!$scope.groupDisabled()) {
                var connection = connections.get($scope.activeUser.id);
                connection.openAndSendFile();
            }
        };


        $scope.bytesToSize = function (bytes, precision) { 
            var kilobyte = 1024;
            var megabyte = kilobyte * 1024;
            var gigabyte = megabyte * 1024;
            var terabyte = gigabyte * 1024;

            if ((bytes >= 0) && (bytes < kilobyte)) {
                return bytes + ' B';

            } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
                return (bytes / kilobyte).toFixed(precision) + ' KB';

            } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
                return (bytes / megabyte).toFixed(precision) + ' MB';

            } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
                return (bytes / gigabyte).toFixed(precision) + ' GB';

            } else if (bytes >= terabyte) {
                return (bytes / terabyte).toFixed(precision) + ' TB';

            } else {
                return bytes + ' B';
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

        $scope.groupDisabled = function() {
            var user = $scope.activeUser;
            if (!user) {
                return true;
            }

            var connection = connections.get(user.id);
            if (connection) {
                if (connection.online) {
                    return false;
                }
                else {
                    $scope.placeholder = "User is offline";
                    return true;
                }
            } 
            else {
                return true;
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
