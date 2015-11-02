
(function() {
    'use strict';

    app.directive('hfProgressBar', function () {
        function link(scope, element, attr) {
            scope.$watch(
                function() {return scope.activeDevice.currentTime;}, 
                function(newValue) {
                    var width = newValue / scope.activeDevice.duration * 100;
                    element.css({'width' : width + "%"});
                }
            );
        }

        return {
            link: link,
        };
    });

})();
