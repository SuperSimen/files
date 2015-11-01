(function() {
    'use strict';

    app.factory('signaling', function(coral, fileTransfer) {
        var messenger = {
            init: function() {
                coral.on('message', messageHandlers.mainHandler);
            },
            send: function(to, type, message) {
                coral.sendMessage(to, {type:type, message:message});
            },
            addMessageHandler: function(handler, type, sender) {
                messageHandlers.add(handler, type, sender);
            }
        };

        var messageHandlers = {
            handlers: {},
            add: function(handler, type, sender) {
                var handlerRecord = createHandlerRecord(handler, type, sender);
                if (!this.handlers[type]) {
                    this.handlers[type] = [];
                }
                this.handlers[type].push(handlerRecord);
            },
            mainHandler: function(data) {
                console.log(data);

                var type = data.type;
                var message = data.message;
                var from = data.fromId;

                var handlers = this.handlers[type];
                if (handlers) {
                    var currentHandler;
                    for (var i in handlers) {
                        currentHandler = handlers[i];
                        if (currentHandler.sender) {
                            if (currentHandler.sender === from) {
                                currentHandler(message, from);
                            }
                            else {
                                noHandlerError(data);
                            }
                        }
                        else {
                            currentHandler(message, from);
                        }
                    }
                }
                else {
                    noHandlerError(data);
                }
            }
        };

        function noHandlerError(data) {
            console.error("No suitable handler for incoming data: " + data);
        }

        function createHandlerRecord(handler, type, sender) {
            return {
                handler: handler,
                type: type,
                sender: sender
            };
        }


        return messenger;
    });
})();
