// dx contrller
angular.module('RxHealth').controller('DxCtrl', ['Http', 'Config','$http','$rootScope', '$scope', '$state', '$resource', '$stateParams', '$mdPanel', 'Toast', dx]);

function dx(Http, Config, $http,$rootScope, $scope, $state, $resource, $stateParams, $mdPanel, Toast){
  $scope.u = JSON.parse($stateParams.user);
  $scope.searchText = "";
  $scope.showcond = false;
  $scope.selectedSymptom = [];
  $scope.evidence = [];
  $scope.symptoms = [];
  $scope.searchTextChange = function(str) {
      var header = {
          'Content-Type': 'application/json ',
          'Accept': 'application/json'
      };

      return $http({
              method: 'POST',
              url: 'http://52.24.83.227/getsymptombydata.php',
              data: {
                  'query': str,
                  'api_key' : "5+`C%@>9RvJ'y?8:"
              },
              headers: header
          })
          .then(function(response) {
              $scope.querylist = [];
              for (var i = 0; i < response.data.Status.Result.length; i++) {
                  $scope.querylist.push({
                      'id': response.data.Status.Result[i].SymptomID,
                      'name': response.data.Status.Result[i].SymptomName
                  })
              }
              return $scope.querylist;
          });

  }
  $scope.next = function() {
      if ($scope.u.age >= 1 && $scope.u.age <= 120) {
          $scope.questionloading = true;
          var evidence = [];
          for (var i = 0; i < $scope.evidence.length; i++) {
              evidence.push({
                  'id': $scope.evidence[i].id,
                  'choice_id': $scope.evidence[i].choice_id
              });
          }
          if ($scope.u.gender == 'Female') {
              $scope.sex = "female";
          } else {
              $scope.sex = "male";
          }
          var data = ({
              "sex": $scope.sex,
              "age": $scope.u.age,
              "evidence": evidence
          });
          var header = {
              'Content-Type': 'application/json ',
              'Accept': 'application/json',
              'app_id': 'e77c6784',
              'app_key': 'b8d453160b8da616fb165e657fcd14e8'
          };
          $http({
              method: 'POST',
              url: 'https://api.infermedica.com/v2/diagnosis',
              data: data,
              headers: header
          }).then(function(res) {
              $scope.conditions = [];
              $scope.matchdata = res.data;
              $scope.questionloading = false;
              //      if($scope.symptoms.length==0)

              for (var i = 0; i < $scope.matchdata.conditions.length; i++) {
                  if ($scope.condition == $scope.matchdata.conditions[i].name)
                      $scope.conditions.push({
                          'ConditionID': $scope.matchdata.conditions[i].id,
                          'ConditionName': $scope.matchdata.conditions[i].name,
                          'CondProb': parseFloat($scope.matchdata.conditions[i].probability * 100).toFixed(2),
                          'match': 1
                      });
                  else
                      $scope.conditions.push({
                          'ConditionID': $scope.matchdata.conditions[i].id,
                          'ConditionName': $scope.matchdata.conditions[i].name,
                          'CondProb': parseFloat($scope.matchdata.conditions[i].probability * 100).toFixed(2),
                          'match': 0
                      });
              }
              $scope.checkmatch();
              //return data
          }, function(err) {
            if(err.status == -1){
              Toast("Please Check Your Internet Connection");
            }
            $scope.questionloading = false;
          });
      }else{
        Toast('please enter valid age');
      }
  };
  $scope.setModelSymptom = function() {
      if ($scope.selectedItem) {
          $scope.showcond = true;
          $scope.selectedIndexSym = 1;
          $scope.searchText = "";
          $scope.evidence.push({
              'id': $scope.selectedItem.id,
              'name': $scope.selectedItem.name,
              'choice_id': "present",
              'match': 0
          });
          $scope.querylist = [];
      }
      $scope.next();
  }
  $scope.onSymptomDelete = function($event, item) {
      $scope.evidence.splice($scope.evidence.indexOf(item), 1);
      if ($scope.evidence.length == 0) $scope.showcond = false;
      //$scope.next();
  };

  $scope.$notes = function(user){
      var conf = Config(600, 600, 'templates/panels/notes.html', Notes, { user : $scope.u});
      $mdPanel.open(conf);
  }

  $scope.add = function($event, item){
      $scope.evidence.push({
          'id': item.SymptomID,
          'name': item.SymptomName,
          'choice_id': "present",
          'match': 0
      });
      $scope.next();
  };

  $scope.add2 = function($event, item, is) {
      $scope.evidence.push({
          'id': item.id,
          'name': item.name,
          'choice_id': is,
          'match': 0
      });
      $scope.next();
  };

  $scope.present = function($event, item) {
      var index = $scope.evidence.indexOf(item);
      var newitem = {
          id: item.id,
          name: item.name,
          choice_id: "present"
      };
      $scope.evidence[index] = newitem;
      //$scope.next();
  };

  $scope.absent = function($event, item) {
      var index = $scope.evidence.indexOf(item);
      var newitem = {
          id: item.id,
          name: item.name,
          choice_id: "absent"
      };
      $scope.evidence[index] = newitem;
  };

  $scope.getmatch = function(item) {
      $scope.selectedIndexSym = 0;
      $scope.condition = item.ConditionName;
      var header = {
          'Content-Type': 'application/json ',
          'Accept': 'application/json'
      };
      $http({
          method: 'POST',
          url: 'http://52.24.83.227/getmatch.php',
          data: {
              'ConditionID': item.ConditionID,
              'api_key' : "5+`C%@>9RvJ'y?8:"
          },
          headers: header
      }).then(function(res) {
          var data = res.data;
          $scope.symptoms = [];
          $scope.getmatchdata = data.Status.Match;
          if ($scope.getmatchdata.length > 0) {
              $scope.condition = item.ConditionName;
          } else {
              $scope.condition = "We are constantly updating our data, Detailed list of symptoms of this Condition will be available soon";
              for (var i = 0; i < $scope.conditions.length; i++)
                  $scope.conditions[i].match = 0;
              for (var i = 0; i < $scope.evidence.length; i++)
                  $scope.evidence[i].match = 0;
          }
          for (var i = 0; i < $scope.getmatchdata.length; i++) {
              $scope.symptoms.push({
                  'SymptomID': $scope.getmatchdata[i].SymptomID,
                  'SymptomName': $scope.getmatchdata[i].SymptomName,
                  'match': 0
              });
          }
          var conf = Config(600, 600, 'templates/panels/condition.html', angular.noop, {
            symptoms : $scope.symptoms,
            condition : $scope.condition,
            add : $scope.add
          })
          $mdPanel.open(conf);
          $scope.checkmatch();
          //$ionicLoading.hide();
          //return data
      }, function(err) {
          if(err.status == -1){
            Toast("Please Check Your Internet Connection");
          }
      });
  };

  $scope.checkmatch = function() {
      var header = {
          'Content-Type': 'application/json ',
          'Accept': 'application/json'
      };
      $http({
          method: 'POST',
          url: 'http://52.24.83.227/getcommonrare.php',
          data: {
              'conditions': $scope.conditions,
              'api_key' : "5+`C%@>9RvJ'y?8:"
          },
          headers: header
      }).then(function(res) {
          $scope.common = res.data.Status.Common;
          $scope.rare = res.data.Status.Rare;
          //return data
      }, function(err) {
        if(err.status == -1){
          Toast("Please Check Your Internet Connection");
        }
      });
      for (var i = 0; i < $scope.evidence.length; i++) {
          for (var j = 0; j < $scope.symptoms.length; j++) {
              $scope.evidence[i].match = 0;
              $scope.symptoms[j].match = 0;
          }
      }
      for (var i = 0; i < $scope.evidence.length; i++) {
          for (var j = 0; j < $scope.symptoms.length; j++) {
              if ($scope.evidence[i].id == $scope.symptoms[j].SymptomID) {
                  $scope.evidence[i].match = 1;
                  $scope.symptoms[j].match = 1;
              }
          }
      }
      if(!$scope.showcond){
        $scope.showcond = true;
      }
  };

  $scope.cancel = function() {
      $state.go('app.home', {}, {
          reload: true
      });

  }
  $scope.submit = function(){
      //$state.go('prescription');
  }



  $scope.createPrescription = function(){
      $scope.submitbuttonpressed = true;
      if($scope.aid && $scope.pfid){
        Http.data('updatedoctorsymptoms', true, function(v){
          $state.go('prescription', {'AID': $scope.aid, 'user' : JSON.stringify($scope.u), 'symptoms' : JSON.stringify($scope.evidence)});
        }, {
          'PFID': $scope.pfid,
          'Symptoms': $scope.evidence,
          'Conditions': $scope.conditions
        }, {}, function(){
          $scope.submitbuttonpressed = false;
        });
      }else{
         var header = {
            'Content-Type': 'application/json ',
            'Accept': 'application/json'
        };
        var date = new Date().getTime();
        Http.data('savenewdata', true, function(res){
          $scope.submitbuttonpressed = false;
          if(res.Status.ResponseCode==200){
            $scope.aid = res.Status.AID;
            $scope.pfid = res.Status.PFID;
            $state.go('prescription', {'AID': $scope.aid, 'user' : JSON.stringify($scope.u), 'symptoms' : JSON.stringify($scope.evidence)});
            //$state.go('dapp.patientdetails', {'AID': $scope.aid});
          }else{
            Toast(res.Status.ResponseMessage);
          }
        }, {'DID' : $rootScope.UserID,
            'Phone': $scope.u.phone,
            'Name': $scope.u.name,
            'Age': $scope.u.age,
            'DOB' : $scope.u.dob,
            'Sex': $scope.u.gender.toLowerCase(),
            'Symptoms': $scope.evidence,
            'Conditions': $scope.conditions,
            'AppointmentDate' : Math.floor(date/1000)});
      }
  }
  if($stateParams.evidence){
    $scope.aid = $stateParams.AID;
    $scope.pfid = $stateParams.PFID;
    var evidence = JSON.parse($stateParams.evidence);
    for(let i=0;i<evidence.length;i++){
      $scope.evidence.push({'id':evidence[i].SymptomID, 'name':evidence[i].Symptom, 'choice_id':evidence[i].SymptomChoice, 'match':0});
    }
    $scope.next();
  }
}
