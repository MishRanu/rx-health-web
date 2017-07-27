
angular.module('RxHealth').controller('AssistantCtrl', ['Http', 'Config', '$rootScope', '$scope', '$state', '$mdPanel', '$timeout', assistent]);

function assistent(Http, Config, $rootScope, $scope, $state, $mdPanel, $timeout){
  var now = new Date();
  var nowyear = new Date(now.getFullYear(), 0, 0).getTime();
  $scope.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  $scope.tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  $scope.u = {};
  Http.data('getclinicdoctors', false, angular.noop, {});
  $scope.$watch(function(){ return $scope.u.group }, function(newa, olde){
    $scope.selectedDay = (newa.getTime() - nowyear)/86400000;
  });

  $scope.refresh = function(){
    $scope.recentSym = Http.data('getsharedsymptoms', true, function(){
      for(let today of $scope.recentSym.Status.TodaySymptoms){
        today.Time = new Date(today.Time);
        var date = new Date(today.Time.getFullYear(), today.Time.getMonth(), today.Time.getDate()).getTime();
        var year = new Date(today.Time.getFullYear(), 0, 0).getTime();
        today.Day = (date - year)/86400000;
      }
    }, {}).$data;
  }

  $scope.openpanel = function(){
    var conf = Config(600, 650, 'templates/panels/confirmappointment.html', ConfirmAppointment, {refresh : $scope.refresh});
    $mdPanel.open(conf);
  }

  $scope.newcase = function(id, AID, itema){

    $scope.itemclicked = true;
    var profile = Http.data('getuserprofile', true, angular.noop, {ID : id, CommuID : $rootScope.CommuID}).$data;
    Http.data('getpatientdata', true, function(v){
      $scope.itemclicked = false;
      var alldata = v.Status;
      alldata.AID = AID;
      var conf = Config(600, 600, 'templates/panels/patientprofilepanel.html', UserProfile, {
        profile : profile,
        alldata : alldata,
        assist : (itema == 'SharedSymptoms')?0:1,
        selectedtab : 1
      });
      $mdPanel.open(conf);
    }, {AID}, {}, function(){
      $scope.itemclicked = false;
    });
  }
  $scope.refresh();
}
