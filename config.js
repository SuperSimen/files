(function() {
	'use strict';

	var configModule = angular.module('config', []);

	configModule.factory('config', function() {
		var config = {};

		config.coralServer = {
			ip: "localhost",
			socketPort: "10011",
			webSocketPort: "10012",
			sslWebSocketPort: "10013",

			getWebSocket: function() {
				var webSocket = "ws://" + this.ip + ":" + this.webSocketPort;
				return webSocket;
			},
		};

		return config;

	});

})();
