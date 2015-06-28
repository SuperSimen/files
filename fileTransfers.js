(function() {
    'use strict';

    app.factory('transfers', function(coral, fileTransfer) {

        var list = {};

        function newTransfer(id) {
            var transfer = fileTransfer.newTransfer();
            var peerConnection = createPeerConnection(id);

            list[id] = {
                peerConnection: peerConnection,
                transfer: transfer,
                sendOnCoral: function(message) {
                    coral.sendMessage(id, createFileMessage(message));
                },
                sendOnWebRTC: function(message) {

                }
            };

            transfer.setSender(
                list[id].sendOnWebRTC;
            );

            createPeerConnection(id);
        }

        function createPeerConnection(id, sendCallback) {
            peerConnection = new RTCPeerConnection(options);

            var dataChannel = peerConnection.createDataChannel("dataChannel", {
                ordered: false
            });

            dataChannel.onopen = function() {
                dataChannel.send(’hi’);
            }

            peerConnection.createOffer(function(offer) {
                peerConnection.setLocalDescription(offer);

                //send offer
            });

            return peerConnection;
        }

        function answer(offer) {
            peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer),
                function() {
                    Success callback
                },
                function(err) {
                    //Error callback
                    console.log(err);
                }
            );

            peerConnection.createAnswer(function(answer) {
                peerConnection.setLocalDescription(answer);
                //send answer
            });
        }

        function createFileMessage(message) {
            return {
                message: message,
                type: "file"
            }
        }

        return {
            get: function(id) {
                if (!list[id]) {
                    newTransfer(id);
                }
                return list[id].transfer;
            }
        }
    });
})();
