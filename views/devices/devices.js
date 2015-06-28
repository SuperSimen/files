(function() {
    'use strict';

    app.factory('devices', function($rootScope, coral, fileTransfer, transfers) {

        var devices = {
            init: function() {
                coral.on("presence", presenceHandler);
                coral.on("message", messageHandler);
                coral.subscribe("presence", "all", "");
            },
            list: [],
            get: function(id) {
                for (var i = 0; i < this.list.length; i++) {
                    if (this.list[i].id === id) {
                        return this.list[i];
                    }
                }
            },
            findById: function(list, id) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === id) {
                        return true;
                    }
                }
                return false;
            },
            updateDevices: function(deviceList) {
                for (var i = 0; i < deviceList.length; i++) {
                    if (!this.findById(this.list, deviceList[i].id)) {
                        this.list.push(deviceList[i]);
                    }
                }
                var deleteThese = [];
                for (i = 0; i < this.list.length; i++) {
                    if (!this.findById(deviceList, this.list[i].id)) {
                        deleteThese.push(this.list[i]);
                    }
                }
                for (i = 0; i < deleteThese.length; i++) {
                    this.list.splice(this.list.indexOf(deleteThese[i]),1);
                }
            }
        };

        function presenceHandler(data) {
            $rootScope.$apply(function() {
                devices.updateDevices(data.presence);
            });
        }

        function messageHandler(data) {
            var message = data.message;
            var device = devices.get(data.fromId);

            if (message.type === "file") {
                transfers.get(device.id).onmessage(message.message);
            }
            else {
                console.error("message type unrecognized");
                console.log(data);
            }
        }

        return devices;

    });

    app.controller('deviceController', function($scope, devices, coral, fileTransfer, transfers) {
        $scope.devices = devices.list;

        var colorList = {};
        $scope.getClass = function(device) {
            var classString = "";
            if (device.className === "webClient") {
                classString += ' pointer';
                if ($scope.activeDevice === device) {
                    classString += ' active';
                    return classString;
                }
            }

            var className = device.className;

            if (!colorList[className]) {
                colorList[className] = Object.keys(colorList).length + 1;
            }
            classString += " color-" + colorList[className];

            return classString;
        };

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
