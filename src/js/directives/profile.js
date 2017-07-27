// profile directive

angular.module('RxHealth').directive('profile', ['Http', '$state', '$mdPanel', '$mdMenu', '$templateCache', '$cookieStore', 'Config', rdprofile]);

function rdprofile(Http, $state, $mdPanel, $mdMenu, $templateCache, $cookieStore, Config){
  $templateCache.removeAll();
  function proffunction(scope){
    [scope.detail, scope.gotoprofile, scope.logout, scope.openotppanel, scope.invite] = [Http.data('userdetail', false, angular.noop, {}),
  function(){
    scope.openprofilepanel = function(v){
      $mdMenu.hide();
      var config = Config(600, 600, 'templates/panels/profilepanel.html', Prof, {
        profile : v,
        obj : scope.obj,
        contactdetails : scope.contactdetails
      })
      $mdPanel.open(config);
    }
    scope.profile = Http.data('getdoctorprofile', false, scope.openprofilepanel, {}).$data;
  },
  () => {
    $cookieStore.remove('UserID');
    location.reload();
  },
  v => {
    [config.locals, config.controller, config.templateUrl] = [{
      obj : scope.obj,
      title : 'Change Password',
      phone : scope.detail.$data.Status.Phone
    }, ForgotPassword, 'templates/panels/changepasswordpanel.html'];
    $mdPanel.open(config);
  },
  function(phone){
        Http.data('otp', true, function(v){
        },{
       'refer': 1,
       'Phone': phone});

 }
  ];
  }
  var directive = {
    restrict : "AE",
    templateUrl : 'templates/profile.html',
    link : proffunction
  }
  return directive;
}
