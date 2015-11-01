(function() {

    'use strict';

    app.factory('connections', function(coral, fileTransfer, signaling) {

        var connections = {};

        signaling.addMessageHandler("offer", offerHandler);

        function offerHandler(from, offer) {
            if (connections[from]) {
                console.log("Received unwanted offer");
            }
            else {
                createP2PConnection(from, offer);
            }
            newTransfer(data.fromId, signal.data);
        }

        function createP2PConnection(to, offer) {
            var connection = connections[to];
            if (connection) {
                if (!connection.connected) {
                    connection.connect(offer);
                }
            }
            else {
                connection = newConnection(to);
                connection.connect(offer);
            }
        }

        function newConnection(id) {
            var transfer = fileTransfer.newTransfer();

            connections[id] = {
                connected: false,
                connect: function(offer) {

                    webrtcConnection = webrtc.connect(
                        id,
                        function() {
                            connections[id].connected = true;
                        },
                        offer
                    );
                },
                sendMessage: null,
                transfer: transfer,
                sendOnWebRTC: function(message) {
                    if (this.dataChannel) {
                        this.dataChannel.send(JSON.stringify(message));
                    }
                    else {
                        console.log("no channel available");
                    }
                },
            };



            transfer.setSender(function(data, callback) {
                connections[id].sendOnWebRTC(data);
            });
        }




        function getTransfer(id) {
            if (!connections[id]) {
                newConnection(id);
            }
            return connections[id].transfer;
        }

        return {
            get: getTransfer,
            init: function() {
                coral.on("message", messageHandler);
            }
        }
    });
})();
