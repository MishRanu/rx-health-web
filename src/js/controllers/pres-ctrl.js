angular.module('RxHealth').controller('PresCtrl', ['Http', 'Config', '$http','$rootScope', '$scope', '$state','$stateParams', '$resource','$mdPanel', prescription]);

function prescription(Http, Config, $http,$rootScope, $scope, $state,$stateParams, $resource, $mdPanel) {
	var id = parseInt($stateParams.AID, 10);
	$scope.user = JSON.parse($stateParams.user);
	$scope.selectedMedicine = [];
	$scope.selectedTest=[];
	$scope.recommendation = "";
	if($stateParams.symptoms){
		let temp = JSON.parse($stateParams.symptoms);
		Http.data('getsuggestions', true, function(v){
			var suggestions = v.Status.Check;
      if(suggestions.length > 0){
				var config = Config(650, 650, 'templates/panels/suggestionpanel.html', Suggestion, {
					suggestions: suggestions,
					selectedMedicine : $scope.selectedMedicine,
					selectedTest : $scope.selectedTest,
					recommendation : $scope.recommendation
				})
				$mdPanel.open(config);
			}
		}, {AID : id, Symptoms : temp});
	}
	$scope.types=['tab','tbsp','ml','mg'];
	$scope.timings=[{name : 'Morning', value : 'morning'},{name : 'Afternoon', value : 'afternoon'},{name : 'Night', value : 'night'},{name : 'On Need', value : 'sos'}];
	$scope.recentTest = [{}];
	 var header = {
            'Content-Type': 'application/json ',
            'Accept': 'application/json'
        };
	$scope.cancel = function(){
		$state.go('app.home');
	}

	$scope.searchTextChange = function(str) {
        var header = {
            'Content-Type': 'application/json ',
            'Accept': 'application/json'
        };

        return $http({
                method: 'POST',
                url: 'http://52.24.83.227/getmedicinebydata.php',
                data: {
                    'data': str,
										'api_key' : "5+`C%@>9RvJ'y?8:"
                },
                headers: header
            })
            .then(function(response) {
			    $scope.querylist = [];
			    for(var i=0;i<response.data.Status.Medicine.length;i++)
			    {
			      $scope.querylist.push({'MID':response.data.Status.Medicine[i].MID, 'name':response.data.Status.Medicine[i].name});

			    }
                return $scope.querylist;
            });

    }
    $http({
                method: 'POST',
                url: 'http://52.24.83.227/getrftest.php',
                data: {
                    'UserID': $rootScope.UserID,
										'api_key' : "5+`C%@>9RvJ'y?8:"
                },
                headers: header
            })
            .then(function(response) {
							$scope.rftloaded = true;
              $scope.recenttest =  response.data.Status.RecentTest;
            	$scope.frequenttest =  response.data.Status.FrequentTest;
            }, function(){
							$scope.rftloaded = true;
						});
    $http({
                method: 'POST',
                url: 'http://52.24.83.227/getrfmedicine.php',
                data: {
                    'UserID': $rootScope.UserID,
										'api_key' : "5+`C%@>9RvJ'y?8:"
                },
                headers: header
            })
            .then(function(response) {
				$scope.rfmloaded = true;
            	$scope.recentmedicine =  response.data.Status.RecentMedicine;
        			$scope.frequentmedicine =  response.data.Status.FrequentMedicine;
            }, function(){
							$scope.rfmloaded = true;
						});
    $scope.searchTestChange = function(str) {
        var header = {
            'Content-Type': 'application/json ',
            'Accept': 'application/json'
        };

        return $http({
                method: 'POST',
                url: 'http://52.24.83.227/gettestbydata.php',
                data: {
                    'data': str,
										'api_key' : "5+`C%@>9RvJ'y?8:"
                },
                headers: header
            })
            .then(function(response) {
			    $scope.querylist1 = [];
			    for(var i=0;i<response.data.Status.Test.length;i++)
			    {
			      $scope.querylist1.push({'TID':response.data.Status.Test[i].TID, 'name':response.data.Status.Test[i].TestName});
			    }
                return $scope.querylist1;
            });

    }
	$scope.kaabil = function(text){
			$scope.selectedMedicine.push({
					'name': text,
					'isafter': true
			});
			$scope.searchText = "";
		}
   	$scope.setMed = function(item) {
        if (item) {
            $scope.searchText = "";
            $scope.selectedMedicine.push({
                'id': item.MID ,
                'name': item.name,
                'isafter': true
            });
            $scope.querylist = [];
        }
    }
	$scope.setTest = function(item) {
	    if (item) {
	        $scope.searchTest = "";
	        $scope.selectedTest.push({name: item.name});
	        $scope.querylist1 = [];
	    }
	    $scope.selectedTest= UniqueArraybyId($scope.selectedTest ,"name");
    }
     $scope.setrecentmed = function (rm) {
     	$scope.selectedMedicine.push({
                'id': rm.MID ,
                'name': rm.Medicine,
                'isafter': true
            });
	    //$scope.selectedMedicine = rm.Medicine;
	  };

      $scope.$notes = function(user){
      var conf = Config(600, 600, 'templates/panels/notes.html', Notes, { user : $scope.user});
      $mdPanel.open(conf);
      }

	  $scope.setfrequentmed = function (rm) {
	    $scope.selectedMedicine.push({
                'id': rm.MID ,
                'name': rm.Medicine,
                'isafter': true
            });
	  };
	  $scope.setrecenttest = function (rm) {
	    $scope.selectedTest.push({name: rm.Test});
	    $scope.selectedTest= UniqueArraybyId($scope.selectedTest ,"name");
	  };
	  $scope.setfrequenttest = function (rm) {
	    $scope.selectedTest.push({name: rm.Test});
	    $scope.selectedTest= UniqueArraybyId($scope.selectedTest ,"name");
	  };
     $scope.onMedDelete = function($event, item) {
        $scope.selectedMedicine.splice($scope.selectedMedicine.indexOf(item), 1);
        if ($scope.selectedMedicine.length == 0) $scope.showTempEpres = false;
        //$scope.next();
    };
    $scope.$watch('selectedMedicine.length', function(newValue,oldValue){
    	if(newValue > 0){$scope.showTempEpres=true}
    	else{$scope.showTempEpres=false}
    });
    $scope.$watch('selectedTest.length', function(newValue,oldValue){
    	if(newValue > 0){$scope.showTempEpres=true}
    	else{$scope.showTempEpres=false}
    });
    $scope.proceed = function(){
			$scope.proceedbuttonclicked = true;
    	$scope.selectedMedicine= UniqueArraybyId($scope.selectedMedicine ,"id");
	    $scope.finalmed = [];
	    $scope.finaltest = [];
	    for(var i=0;i<$scope.selectedMedicine.length;i++)
	    {	$scope.selectedMedicine[i].morning = $scope.selectedMedicine[i].afternoon = $scope.selectedMedicine[i].night=0;
	    	$scope.selectedMedicine[i].sos = false;
	    	for(var j=0;j<$scope.selectedMedicine[i].selectedTimings.length;j++){
	    		if($scope.selectedMedicine[i].selectedTimings[j] == "morning"){$scope.selectedMedicine[i].morning=1}
	    		else if($scope.selectedMedicine[i].selectedTimings[j] == "afternoon"){$scope.selectedMedicine[i].afternoon=1}
	    		else if($scope.selectedMedicine[i].selectedTimings[j] == "night"){$scope.selectedMedicine[i].night=1}
	    		else if($scope.selectedMedicine[i].selectedTimings[j] == "sos"){$scope.selectedMedicine[i].sos = 1}
	    	}
	      $scope.finalmed.push({'Medicine': $scope.selectedMedicine[i].name, 'Dosage': $scope.selectedMedicine[i].dose, 'Type': $scope.selectedMedicine[i].type,
	        'Days': $scope.selectedMedicine[i].days, 'Morning': $scope.selectedMedicine[i].morning, 'Afternoon': $scope.selectedMedicine[i].afternoon,
	        'Night': $scope.selectedMedicine[i].night, 'OnNeed': $scope.selectedMedicine[i].sos, 'IsAfter': $scope.selectedMedicine[i].isafter});
	    }
	     for(i=0;i<$scope.selectedTest.length;i++)
	    {
	      $scope.finaltest.push({'TestName': $scope.selectedTest[i].name});
	    }
			Http.data('saveprescriptiontemp', true, function(v){
				Http.data('getdoctorconditions', false, function(v1){
					var config = Config(600,600, 'templates/panels/patientprofilepanel.html', UserProfile, {
						prescriptiondetails : v,
						submitpres : v1,
                        selectedtab : 2
					});
					$mdPanel.open(config).then(function(value){
						$scope.proceedbuttonclicked = false;
					});
				},{});
			},{'AID': id, 'Prescription': $scope.finalmed, 'Test': $scope.finaltest, 'Comment': $scope.user.recommendation, 'Notes': JSON.stringify($scope.user.notes)}, {}, function(){
				$scope.proceedbuttonclicked = false;
			});
    }

    function UniqueArraybyId(collection, keyname) {
              var output = [],
                  keys = [];

              angular.forEach(collection, function(item) {
                  var key = item[keyname];
                  if(keys.indexOf(key) === -1) {
                      keys.push(key);
                      output.push(item);
                  }
              });
        return output;
   };
};
