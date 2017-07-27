 // communities contrller
angular.module('RxHealth').controller('CommunitiesCtrl', ['Http', 'Config','$rootScope', '$scope', '$state', '$timeout', '$mdPanel', '$stateParams',communities]);

function communities(Http, Config, $rootScope, $scope, $state, $timeout, $mdPanel, $stateParams){
  var tag = $stateParams.Tag;
  $scope.IDE = $rootScope.UserID;
  $scope.communities = Http.data('getcommunities', false, angular.noop, {});
  $scope.selected = 'all';
  $scope.infiniteItems = new Infinite(Http, Config, $mdPanel, $rootScope.UserID, tag);
  $scope.stringifi = stringify;
}
