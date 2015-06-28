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

var peerConnection = new RTCPeerConnection(options);

var dataChannel = peerConnection.createDataChannel("dataChannel", {
    ordered: false
});

dataChannel.onopen = function() {
    dataChannel.send(’hi’);
}

function call(sendCallback) {
    peerConnection.createOffer(function(offer) {
        peerConnection.setLocalDescription(offer);
        sendCallback(offer);
    });
}

function answer(offer, sendCallback) {
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
        sendCallback(answer);
    });
}
