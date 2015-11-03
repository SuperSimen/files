(function() {

    'use strict';

    app.factory('connections', function(coral, fileTransfer, signaling, webrtc, $rootScope, $q, $timeout) {
        
        var connections = {};

        var returnObject = {
            list: connections,
            get: getConnection,
            activeConnection: null,
            connect: getConnectionAndConnect,
            myId: "",
            init: function() {
                signaling.init();
                this.myId = coral.myId;
                coral.on("presence", presenceHandler);
                coral.subscribe("presence", "all", "");

                signaling.addMessageHandler(offerHandler, "offer");

                $rootScope.$watch(
                    function() {return returnObject.activeConnection;},
                    function(newConnection) {
                        if (newConnection) {
                            newConnection.conversation.resetUnread();
                        }
                    }
                );
            }
        };

        function getConnection(id) {
            return connections[id];
        }

        function getConnectionAndConnect(id) {
            var connection = connections[id];
            if (!connection.webrtcConnection) {
                connection.connect();
            }
            return connection;

        }

        function setOnlineStatus(listOfOnlineIds) {
            for (var id in connections) {
                if (listOfOnlineIds[id]) {
                    connections[id].online = true;
                }
                else {
                    connections[id].online = false;
                }
            }
        }

        function presenceHandler(data) {
            var currentUser;
            var listOfOnlineUsers = data.presence;
            var listOfOnlineIds = {};
            for (var i in listOfOnlineUsers) {
                currentUser = listOfOnlineUsers[i];
                listOfOnlineIds[currentUser.id] = true;

                if (!connections[currentUser.id]) {
                    var connection = createAndAddConnection(currentUser.id);
                    connection.name = currentUser.name;
                }
            }
            $rootScope.$apply(function() {
                setOnlineStatus(listOfOnlineIds);
            });
        }


        function offerHandler(from, offer) {
            var connection = getConnection(from);
            if (connection) {
                connection.connect(offer);
            }
            else {
                console.log("Received unwanted offer");
            }
        }

        function createAndAddConnection(id) {
            var connection = createConnection(id);
            addConnection(id, connection);
            return connection;
        }

        function addConnection(id, connection) {
            if (connections[id]) {
                return console.error("cannot add connection, id already exists");
            }

            connections[id] = connection;
        }

        function createConnection(id) {

            var transfer = fileTransfer.newTransfer();
            var connection = createConnectionObject(id, transfer);

            transfer.setSender(function(message, callback) {
                connection.sendFileMessage(message, callback);
            });

            return connection;
        }

        function createConnectionObject(id, transfer) {
            var connectionObject = {
                online: false,
                webrtcConnection: null,
                id: id,
                name: null,
                connect: function(offer) {
                    this.webrtcConnection = webrtc.connect(id, offer);
                    var receiver = createReceiver(id, transfer);
                    this.webrtcConnection.setReceiver(receiver);
                },
                transfer: transfer,
                sendData: function(data, priority, callback) {
                    if (this.webrtcConnection) {
                        this.webrtcConnection.send(data, priority, callback);
                    }
                    else {
                        console.error("Cannot send. No webrtc connection available");
                    }
                },
                sendMessage: function(message) {
                    var messageObject = {
                        type: "message",
                        message: message,
                    };
                    this.sendData(messageObject, true);
                    this.conversation.addMessage(message, coral.myId);
                },
                sendFileMessage: function(fileMessage, callback) {
                    var fileMessageObject = {
                        type: "file",
                        message: fileMessage,
                    };
                    this.sendData(fileMessageObject, false, callback);
                },
                sendStatusMessage: function(statusMessage) {
                    var statusMessageObject = {
                        type: "status",
                        message: statusMessage,
                    };
                    this.sendData(statusMessageObject, true);

                },
                sendFile: function(file) {
                    

                    var fileId = this.transfer.sendFile(file);
                    this.sendStatusMessage({fileId: fileId});
                    this.conversation.addFileMessage(fileId, coral.myId);
                },
                openAndSendFile: function() {
                    openFileSelector().then(function(file) {
                        connectionObject.sendFile(file);
                    });
                },
                conversation: createConversation(),
            };

            return connectionObject;
        }

        function createConversation() {
            var conversation = {
                history: [],
                unread: 0,
                add: function(object) {
                    this.history.push(object);
                },
                addMessage: function(message, sender) {
                    this.add({message: message, sender: sender});
                },
                addFileMessage: function(fileId, sender) {
                    this.add({fileId: fileId, sender: sender});
                },
                incrementUnread: function() {
                    this.unread++;
                },
                resetUnread: function() {
                    this.unread = 0;
                }

            };

            return conversation;
        }

        function createReceiver(id, transfer) {
            return function (message) {
                if (message.type === "file") {
                    transfer.onmessage(message.message);
                }
                else if (message.type === "message") {
                    $rootScope.$apply(function() {
                        connections[id].conversation.addMessage(message.message, id);
                        incrementIfNotActive(id);
                    });
                }
                else if (message.type === "status") {
                    if (message.message.fileId) {
                        connections[id].conversation.addFileMessage(message.message.fileId, id);
                        incrementIfNotActive(id);

                    }
                }
                else {
                    console.error("Received unrecognized p2p message");
                }
            }
        }

        function incrementIfNotActive(id) {
                if (connections[id] !== returnObject.activeConnection) {
                    connections[id].conversation.incrementUnread();
                }
        }

        var el = null;

        function openFileSelector () {

            var defer = $q.defer();

            function onfilesubmitted(event) {
                if(el.files.length > 0) {
                    defer.resolve(el.files[0]);
                } else {
                    defer.reject('no files available');
                }
            }

            if(!el) {
                el = document.createElement('input');

                el.id = "fileupload-faux";
                el.setAttribute('type', 'file');

                el.style.position = "fixed";
                el.style.left = "-100px";

                document.body.appendChild(el);
            }

            el.onchange = onfilesubmitted;

            var e =  new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });

            $timeout(function() {
                el.dispatchEvent(e);
            },0);

            return defer.promise;
        };
        return returnObject;
    });
})();
