// history contrller

angular.module('RxHealth').controller('HistoryCtrl', ['$rootScope', 'Config', '$scope', '$state', 'Http', '$mdPanel', '$timeout', History]);

function History($rootScope, Config, $scope, $state, Http, $mdPanel, $timeout){
  $scope.selectdisabled = false;
  [$scope.todos, $scope.mypatients, $scope.openPrescription, $scope.reload] = [Http.data('getcompletedsymptoms', true, angular.noop, {}).$data,
    Http.data('getconnections', true, angular.noop, {is : '2,3', require : ['connection']}).$data,
    (AID, id) => {
      if(!$scope.selectdisabled){
        $scope.selectdisabled = true;
        var prescriptiondetails = Http.data('getprescription',true, angular.noop, {AID}).$data;
        var profile = Http.data('getuserprofile', true, angular.noop, {ID : id, CommuID : $rootScope.CommuID}).$data;
        Http.data('getpatientdata', true, function(v){
          var alldata = v.Status;
          var conf = Config(600, 600, 'templates/panels/patientprofilepanel.html', UserProfile, {
            prescriptiondetails : prescriptiondetails,
            alldata : alldata,
            profile : profile,
            selectedtab : 2
          });
          $mdPanel.open(conf);
          $scope.selectdisabled = false;
        },{AID})
      }
    },
    function(pid, name){
      $scope.current = name;
      $scope.todos = Http.data('getcompletedsymptoms', true, angular.noop, { PID : pid }).$data;
    }
  ];
};
