var globalElement;
(function() {
    'use strict';

    app.directive("hfAutoScroll", function() { 
        return function(scope, element, attrs) {
            scope.$watch(
                function() {return element[0].scrollHeight;},
                function() {
                    element[0].scrollTop = element[0].scrollHeight;
                }
            );
        };
    });
})();
