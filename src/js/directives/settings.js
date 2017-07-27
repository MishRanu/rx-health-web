// settings directive

angular.module('RxHealth').directive('settings', rdsettings);
function rdsettings(){
  function settfunction(scope, element, attrs){
    scope.account = ["Change Password", "Logout"];
    scope.general = ["About Us", "Terms and Conditions"];
  }
  var directive = {
    restrict : "AE",
    templateUrl : 'templates/settings.html',
    link : settfunction
  }
  return directive;
}
