(function() {
    'use strict';

    app.factory('transfers', function(coral, fileTransfer) {

        var listOfFileTransfers = {};

        var fileTransfers = {};

        fileTransfers.get = function(id) {
            if (!listOfFileTransfers[id]) {
                newTransfer(id);
            }
            return listOfFileTransfers[id];
        };

        function newTransfer(id) {
            var transfer = fileTransfer.newTransfer();
            listOfFileTransfers[id] = transfer;
            transfer.setSender(
                function(message) {
                    coral.sendMessage(id, createFileMessage(message));
                }
            );
        }

        function createFileMessage(message) {
            return {
                message: message,
                type: "file"
            }
        }

        return fileTransfers;

    });
})();
