(function() {
    'use strict';

    app.factory('webrtc', function(coral, signaling, $timeout) {

        var webrtc = {
            connect: connect
        };

        function connect(to, offer) {
            var iceCandidates = createIceCandidates(to);
            var peerConnection = new webkitRTCPeerConnection(options);

            setupConnectionHandlers(peerConnection, iceCandidates, to);

            var messenger = {
                incoming: null,
                outgoing: null
            };

            continueConnect(peerConnection, iceCandidates, to, messenger, offer);

            var connection = {
                send: function(message) {
                    if (messenger.outgoing) {
                        messenger.outgoing(message);
                    }
                    else {
                        console.error("cannot send message. No sender function");
                    }
                },
                setReceiver: function(handler) {
                    if (messenger.incoming) {
                        console.error("webrtc handler already set");
                    }
                    else {
                        messenger.incoming = handler;
                    }
                }
            };

            return connection;
        }

        function createIceCandidates(id) {
            return {
                ICECandidates: [],
                readyToSend: false,
                setReadyToSend: function(ready) {
                    this.readyToSend = ready;
                    console.log("ready to send");
                    if (ready && this.ICECandidates.length) {
                        this.sendAndEmptyIceCandidates();
                    }
                },
                addIceCandidate: function (candidate) {
                    console.log("adding ice candidate");
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

        function setupConnectionHandlers(peerConnection, iceCandidates, to) {
            var answerHandler = createAnswerHandler(peerConnection, iceCandidates);
            signaling.addMessageHandler(answerHandler, "answer", to);

            var iceHandler = createIceHandler(peerConnection);
            signaling.addMessageHandler(iceHandler, "ice", to);
        }

        function continueConnect(peerConnection, iceCandidates, id, messenger, offer) {
            peerConnection.onicecandidate = function(event) {
                console.log("on ice candidate");
                console.log(event);
                if (event.candidate) {
                    iceCandidates.addIceCandidate(event.candidate);
                }
            };

            if (offer) {
                peerConnection.ondatachannel = function(event) {
                    setupDataChannel(event.channel, id, messenger);
                };

                setRemoteDescription(peerConnection, offer);

                createAnswerAndSend(id, peerConnection, offer);
                iceCandidates.setReadyToSend(true);
            }
            else {
                var dataChannel = peerConnection.createDataChannel("dataChannel", {
                    ordered: false
                });

                setupDataChannel(dataChannel, id, messenger);

                createOfferAndSend(id, peerConnection);

                console.log("here");

            }
        }

        function createAnswerHandler(peerConnection, iceCandidates) {
            return function (from, answer) {
                console.log("received answer");
                setRemoteDescription(peerConnection, answer);
                iceCandidates.setReadyToSend(true);
            }
        }

        function createIceHandler(peerConnection) {
            return function (from, iceCandidate) {
                console.log("received ice");
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

        function setupDataChannel(dataChannel, id, messenger) {
            var dataSender = createDataSender(dataChannel);

            dataChannel.onopen = function() {
                console.log("data channel opened");

                messenger.outgoing = function(message) {
                    dataSender.addToQueue(message);
                }
            };

            dataChannel.onmessage = function(event) {
                console.log(event.data);
                if (messenger.incoming) {
                    messenger.incoming(JSON.parse(event.data));
                }
                else {
                    console.error("No handler for incoming webrtc data");
                }

                connections[id].transfer.onmessage(JSON.parse(event.data));
            };


        }

        function createDataSender(dataChannel) {
            var dataSender = {
                queue: [],
                sendingData: false,
                send: function(data, callback) {
                    if (dataChannel.bufferedAmount === 0) {
                        var message = JSON.stringify(data);
                        dataChannel.send(message);

                        if (callback) {
                            callback("sent");
                        }
                        return true;
                    }
                    else {
                        return false
                    }
                },
                sender: function() {
                    while(this.queue.length) {
                        var success = this.send(this.queue[0]);
                        if (!success) {
                            $timeout(this.restartDataSender, 100);
                            return;
                        }
                        else {
                            this.queue.shift();
                        }
                    }
                    this.sendingData = false;

                },
                addToQueue: function(data) {
                    this.queue.push(data);

                    if (!this.sendingData) {
                        this.sendingData = true;
                        this.restartDataSender();
                    }
                },

            };

        }


        function setRemoteDescription(peerConnection, sdp) {
            peerConnection.setRemoteDescription(
                new RTCSessionDescription(sdp),
                function() {},
                function(err) {
                    console.log(err);
                }
            );
        }

        function createOfferAndSend(id, peerConnection) {
            peerConnection.createOffer(function(offer) {
                peerConnection.setLocalDescription(offer);

                signaling.send(id, "offer", offer);
            });

        }

        function createAnswerAndSend(id, peerConnection, offer) {
            peerConnection.createAnswer(function(answer) {
                peerConnection.setLocalDescription(answer);

                signaling.send(id, "answer", answer);
            });
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

        return webrtc;
    });
})();
