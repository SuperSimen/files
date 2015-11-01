(function() {
    'use strict';

    app.factory('webrtc', function(coral, signaling) {

        var webrtc = {
            connect: connect
        };

        function createIceHandler(peerConnection) {
            return function (from, iceCandidate) {
                var ice = new RTCIceCandidate(iceCandidate);
                peerConnection.addIceCandidate(
                    ice,
                    function() {},
                    function(err) {
                        console.log(err);
                    }
                );
            }
        }

        function createAnswerHandler(peerConnection, iceCandidates) {
            return function (from, answer) {
                connections[data.fromId].peerConnection.setRemoteDescription(
                    new RTCSessionDescription(answer),
                    function() {},
                    function(err) {
                        console.log(err);
                    }
                );
                iceCandidates.setReadyToSend(true);
            }
        }

        function connect(to, successCallback, offer) {

            var iceCandidates = createIceCandidates(id);
            var peerConnection = new webkitRTCPeerConnection(options);

            var answerHandler = createAnswerHandler(peerConnection, iceCandidates);
            signaling.addMessageHandler(answerHandler, "answer", to);

            var iceHandler = createIceHandler(peerConnection);
            signaling.addMessageHandler(iceHandler, "ice", to);

            peerConnection.onicecandidate = function(event) {
                if (event.candidate) {
                    iceCandidates.addIceCandidate(event.candidate);
                }
            };

            peerConnection.ondatachannel = function(event) {
                setupDataChannel(event.channel, id);
            };

            if (offer) {
                peerConnection.setRemoteDescription(
                    new RTCSessionDescription(offer),
                    function() {},
                    function(err) {
                        console.log(err);
                    }
                );

                sendAnswer(id, peerConnection, offer);
                iceCandidates.setReadyToSend(true);
            }
            else {
                var dataChannel = peerConnection.createDataChannel("dataChannel", {
                    ordered: false
                });

                setupDataChannel(dataChannel, id);

                sendOffer(id, peerConnection);
            }

            successCallback(messageSender); 
        }


        function createIceCandidates(id) {
            return {
                ICECandidates: [],
                readyToSend: false,
                setReadyToSend: function(ready) {
                    this.readyToSend = ready;
                    if (ready && this.ICECandidates.length) {
                        this.sendAndEmptyIceCandidates();
                    }
                },
                addIceCandidate: function (candidate) {
                    this.ICECandidates.push(candidate);
                    if (this.readyToSend) {
                        this.sendAndEmptyIceCandidates();
                    }
                },
                sendAndEmptyIceCandidates: function() {
                    for (var i in this.ICECandidates) {
                        signaling.send(id, "ice", this.ICECandidates[i]);
                    }
                    this.ICECandidates.length = 0;
                }

            };
        }
        var options = {
            iceServers: [
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                }
            ]
        }


        function sendOffer(id, peerConnection) {
            peerConnection.createOffer(function(offer) {
                peerConnection.setLocalDescription(offer);

                signaling.send(id, "offer", offer);
            });

        }

        function sendAnswer(id, peerConnection, offer) {
            peerConnection.createAnswer(function(answer) {
                peerConnection.setLocalDescription(answer);

                signaling.send(id, "answer", answer);
            });

        }

        function setupDataChannel(dataChannel, id) {
            dataChannel.onopen = function() {
                console.log("data channel opened");
            };

            dataChannel.onmessage = function(event) {
                console.log(event.data);
                connections[id].transfer.onmessage(JSON.parse(event.data));
            };

            connections[id].dataChannel = dataChannel;

        }

        return webrtc;
    });
})();
