/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('RxHealth')
    .directive('rdLoading', ['$timeout', rdLoading]);

function rdLoading($timeout) {
    var directive = {
      scope: {
          loading: '=',
          classes: '@?'
        },
        transclude : true,
        restrict: 'AE',
        template: '<div ng-show="loading" layout-fill layout><div layout layout-fill layout-align = "center center"><md-progress-circular md-mode="indeterminate"></md-progress-circular></div></div><div ng-hide="loading" layout-fill ng-transclude></div>'
    };
    return directive;
};
