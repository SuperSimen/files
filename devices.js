(function() {

	'use strict';

	app.factory('devices', function($rootScope, coral, utility) {

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
			if (message.type === "command-reply") {
				if (message.error) {
					console.log('Error from ' + data.fromId + ' - ' + message.error);
				}
				else {
					$rootScope.$apply(function() {
						if (message.command === 'load') {
							device.command = 'play';
							device.title = utility.getParameterFromFilename(message.title, 't');
						}
						else if (message.command === 'stop') {
							device.command = 'stop';
							device.title = "";
							device.currentTime = 0;
						}
						else if (message.command === 'pause') {
							device.command = 'pause';
						}
						else if (message.command === 'play') {
							device.command = 'play';
						}
					});
				}
			}
			if (message.type === "time-update") {
				if (device.command !== 'stop') {
					$rootScope.$apply(function() {
						device.currentTime = message.currentTime;
						if (device.duration !== message.duration) {
							device.duration = message.duration;
						}
					});
				}
			}
		}

		return devices;

	});

	app.controller('deviceController', function($scope, devices, coral) {
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
			if (device.className === "webClient") {
				if ($scope.activeDevice === device) {
					$scope.activeDevice = null;
				}
				else {
					$scope.activeDevice = device;
				}
			}
		};

		$scope.showMedia = function(row) {
			if ($scope.activeDevice && $scope.activeDevice.className === 'webClient') {
				var activeRow = Math.floor(devices.list.indexOf($scope.activeDevice) / 4);
				return activeRow === row;
			}
			else {
				return false;
			}
		};

		$scope.showControl = function(control) {
			var command = $scope.activeDevice.command;
			if (!$scope.activeDevice) {
				return false;
			}
			else if (control === 'play') {
				return command === "pause";
			}
			else if (control === 'pause') {
				return command === "play" || command === "load";
			}
			else if (control === 'stop') {
				return command === "pause" || command === "load" || command === 'play';
			}
			else if (control === 'bar') {
				return command === "pause" || command === "load" || command === 'play';
			}
			else {
				return false;
			}
		};

		$scope.control = function(command, media) {
			if (!$scope.activeDevice) {
				return console.error("cannot control nonexistant device");
			}
			var message = {
				type: command
			};
			if (command === 'load' && media) {
				message.title = media.title;
				message.path = media.path.$$unwrapTrustedValue();
			}
			else if (command === 'go-to' && $scope.activeDevice.goToTime) {
				message.goToTime = $scope.activeDevice.goToTime;
			}
			coral.sendMessage($scope.activeDevice.id, message);
		};

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
	app.directive('hfClickBar', function () {
		function link(scope, element, attr) {

			element.on('click', function(event) {
				scope.activeDevice.goToTime = event.offsetX / element[0].offsetWidth * scope.activeDevice.duration;
				scope.control('go-to');
			});
		}

		return {
			link: link,
		};
	});

})();
