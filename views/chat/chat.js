(function() {
    'use strict';

    app.factory('chat', function($rootScope, coral, fileTransfer, transfers) {

        var chat = {
            init: function() {
            }
        };

        return devices;

    });

    app.controller('chatController', function() {

        $scope.clickOnDevice = function(device) {
            sendFileTo(device.id);
        };

        function sendFileTo(id) {
            var transfer = transfers.get(id);

            if (fileTransfer.file) {
                transfer.sendFile();
                console.log(fileTransfer.file);
            }
            else {
                console.error("no file");
            }
        }
    });

    app.directive('hfProgressBar', function () {
        function link(scope, element, attr) {
            scope.$watch(
                function() {return scope.activeDevice.currentTime;}, 
                function(newValue) {
                    var width = newValue / scope.activeDevice.duration * 100;
                    element.css({'width' : width + "%"});
                }
            );
        }

        return {
            link: link,
        };
    });

})();
