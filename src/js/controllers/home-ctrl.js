// home contrller
angular.module('RxHealth').controller('HomeCtrl', ['Http', 'Config', '$rootScope', '$scope', '$state', '$mdPanel', home]);

function home(Http, Config, $rootScope, $scope, $state, $mdPanel) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }
  today = yyyy+'-'+mm+'-'+dd;
  document.getElementById("datefield").setAttribute("max", today);
  yyyy -= 120;
  today = yyyy+'-'+mm+'-'+dd;
  document.getElementById("datefield").setAttribute("min", today);
  Http.data('getcommunities', false, function(v){
    $rootScope.CommuID = v.Status.myCommunities[0].CommuID;
  }, {});
  $scope.refreshcases = function(){
    $scope.recentSym = Http.data('getsharedsymptoms', true, angular.noop, { 'UserID': $rootScope.UserID }).$data;
  }
    $scope.u = {
        gender: 'Male'
    }
    $scope.refreshcases();
    $scope.proceed = function() {
        $scope.u.age = getAge($scope.u.dob);
        $scope.u.dob = Math.floor($scope.u.dob.getTime()/1000);
        $state.go('dxmate', {user : JSON.stringify($scope.u)});
    }
    $scope.newcase = function(id, AID){
      $scope.itemclicked = true;
      var profile = Http.data('getuserprofile', true, angular.noop, {ID : id, CommuID : $rootScope.CommuID}).$data;
      Http.data('getpatientdata', true, function(v){
        Http.data('getdoctorconditions', false, function(v1){
          $scope.itemclicked = false;
          var alldata = v.Status;
          alldata.AID = AID;
          var conf = Config(600, 600, 'templates/panels/patientprofilepanel.html', UserProfile, {
            profile : profile,
            alldata : alldata,
            selectedtab : 1,
            submitpres : v1
          });
          $mdPanel.open(conf);
				},{});
      }, {AID}, {}, function(){
        $scope.itemclicked = false;
      });
    }
};
