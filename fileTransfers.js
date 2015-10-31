(function() {

    app.factory('transfers', function(coral, fileTransfer) {

        var list = {};

        function messageHandler(data) {
            var message = data.message;

            console.log(data);
            if (message.type === "file") {

                //transfers.get(device.id).onmessage(message.message);
            }
            else if (message.type === "signal") {
                console.log("received signal message");
                console.log(message);
                var signal = message.message;
                if (signal.type === "offer") {
                    console.log("received offer");
                    newTransfer(data.fromId, signal.data);
                }
                else if (signal.type  === "answer") {
                    list[data.fromId].peerConnection.setRemoteDescription(
                        new RTCSessionDescription(signal.data),
                        function() {},
                        function(err) {
                            console.log(err);
                        }
                    );
                    list[data.fromId].iceCandidates.setReadyToSend(true);
                }
                else if (signal.type === "ice") {
                    var ice = new RTCIceCandidate(signal.data);
                    list[data.fromId].peerConnection.addIceCandidate(ice, function() {
                        console.log("added ice");
                    },
                    function(err) {
                        console.log(err);
                    }
                                                                    );
                }
            }
            else {
                console.error("message type unrecognized");
                console.log(data);
            }
        }

        function newTransfer(id, offer) {
            console.log("new transfer " + id);
            var transfer = fileTransfer.newTransfer();

            list[id] = {
                transfer: transfer,
                sendOnCoral: function(message) {
                    coral.sendMessage(id, createSignalMessage(message));
                }, 
                sendOnWebRTC: function(message) {
                    if (this.dataChannel) {
                        this.dataChannel.send(JSON.stringify(message));
                    }
                    else {
                        console.log("no channel available");
                    }
                },
            };

            list[id].iceCandidates = createIceCandidates(id);
            list[id].peerConnection = createPeerConnection(id, offer);

            function createIceCandidates(id) {
                return {
                    ICElist: [],
                    readyToSend: false,
                    setReadyToSend: function(ready) {
                        this.readyToSend = ready;
                        if (ready && this.ICElist.length) {
                            this.sendAndEmptyIceCandidates();
                        }
                    },
                    addIceCandidate: function (candidate) {
                        this.ICElist.push(candidate);
                        if (this.readyToSend) {
                            this.sendAndEmptyIceCandidates();
                        }
                    },
                    sendAndEmptyIceCandidates: function() {
                        console.log("sending ice");
                        for (var i in this.ICElist) {
                            list[id].sendOnCoral({type: "ice", data:this.ICElist[i]});
                        }
                        this.ICElist.length = 0;
                    }

                };
            }

            transfer.setSender(function(data, callback) {
                list[id].sendOnWebRTC(data);
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


        function createPeerConnection(id, offer) {
            var peerConnection = new webkitRTCPeerConnection(options);

            peerConnection.onicecandidate = function(event) {
                console.log("incoming ice");
                if (event.candidate) {
                    list[id].iceCandidates.addIceCandidate(event.candidate);
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

                peerConnection.createAnswer(function(answer) {
                    peerConnection.setLocalDescription(answer);

                    list[id].sendOnCoral({type:"answer", data:answer});
                });

                list[id].iceCandidates.setReadyToSend(true);
            }
            else {

                var dataChannel = peerConnection.createDataChannel("dataChannel", {
                    ordered: false
                });

                setupDataChannel(dataChannel, id);

                peerConnection.createOffer(function(offer) {
                    peerConnection.setLocalDescription(offer);

                    list[id].sendOnCoral({type:"offer", data:offer});
                });
            }

            return peerConnection;
        }

        function setupDataChannel(dataChannel, id) {
            dataChannel.onopen = function() {
                console.log("data channel opened");
            };

            dataChannel.onmessage = function(event) {
                console.log(event.data);
                list[id].transfer.onmessage(JSON.parse(event.data));
            };

            list[id].dataChannel = dataChannel;

        }

        function createFileMessage(message) {
            return {
                message: message,
                type: "file"
            }
        }

        function createSignalMessage(message) {
            return {
                message: message,
                type: "signal"
            }
        }

        function getTransfer(id) {
            if (!list[id]) {
                newTransfer(id);
            }
            return list[id].transfer;
        }

        return {
            get: getTransfer,
            init: function() {
                coral.on("message", messageHandler);
            }
        }
    });
})();
