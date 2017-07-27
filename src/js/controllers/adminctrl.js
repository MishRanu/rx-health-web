// admin controller

angular.module('RxHealth').controller('AdminHomeCtrl', ['$http','Http', 'Config', '$rootScope', '$scope', '$state', '$mdPanel', '$stateParams', '$mdDialog', '$timeout', 'Toast', admin]);

function admin( $http, Http, Config, $rootScope, $scope, $state, $mdPanel, $stateParams, $mdDialog, $timeout, Toast){
  $scope.commuid = $stateParams.CommuID;
  if($scope.commuid){
    $scope.clinics = [];
    Http.data('getclinics', true, function(v){
      $scope.clinics = v.Status.Clinics;
      if($scope.clinics.length > 0){
        $scope.currentNavItem = 0;
        $scope.refreshdoctors();
      }else{
        $scope.doctors = {Status : {Doctors : []}, $resolved : true};
        $scope.todos = {Status : {SharedSymptoms : []}, $resolved : true};
      }
    }, {CommuID : $scope.commuid});
    $scope.refreshdoctors = function(){
      $scope.doctors = Http.data('getclinicdoctors', true, function(v){
        if(v.Status.Doctors.length > 0){
          $scope.refreshcasehistory(v.Status.Doctors[0].DID);
        }else{
          $scope.todos = {Status : {SharedSymptoms : []}, $resolved : true};
        }
      }, {ClinicID : $scope.clinics[$scope.currentNavItem].ClinicID}).$data;
    }
    $scope.refreshcasehistory = function(did){
      var userid = $rootScope.UserID;
      $rootScope.UserID = did;
      $scope.todos = Http.data('getcompletedsymptoms', true, function(){
        $rootScope.UserID = userid;
      }, { DID :did, ClinicID : $scope.clinics[$scope.currentNavItem].ClinicID}).$data;
    }
    $scope.openPrescription = function(AID,id){
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
    }
    $scope.adddoctor = function(){
      var config = Config(600, 650, 'templates/panels/adddoctor.html', AddDoctor, {ClinicID : $scope.clinics[$scope.currentNavItem].ClinicID});
      $mdPanel.open(config);
    }
    $scope.deleteclinic = function(ev){
      if($scope.clinics.length < 2){
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Message')
            .textContent('You have to keep at least one clinic')
            .ariaLabel('Alert Dialog delete clinic')
            .ok('Got it!')
            .targetEvent(ev)
        );
      }else{
        var confirm = $mdDialog.confirm()
              .title('Delete Clinic?')
              .textContent('Would you like to delete '+$scope.clinics[$scope.currentNavItem].Name+'?')
              .ariaLabel('Delete clinic Confirm')
              .targetEvent(ev)
              .ok('Delete it!')
              .cancel("Don't do it");

        $mdDialog.show(confirm).then(function() {
          Http.data('deleteclinic', true, function(){
          $scope.clinics.splice($scope.currentNavItem,1);
          $timeout(function(){
            $scope.refreshdoctors();
          }, 1000);
        }, {ClinicID : $scope.clinics[$scope.currentNavItem].ClinicID});
        });
      }
    }

    $scope.editfees = function(ev, index){
      var doctor = $scope.doctors.Status.Doctors[index];
      var confirm = $mdDialog.prompt()
        .title('Fees?')
        .textContent('Fees ')
        .placeholder('Fees in Rupees')
        .ariaLabel('Fees')
        .initialValue(doctor.Fees.toString())
        .targetEvent(ev)
        .ok('Change')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function(result) {
        if(!isNaN(result)){
          Http.data('editfees', true, function(v){
            doctor.Fees = Number(result);
            Toast(v.Status.ResponseMessage);
          }, { ClinicID : $scope.clinics[$scope.currentNavItem].ClinicID, DID : doctor.DID, Fees : Number(result)});
        }else{
          $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Alert')
            .textContent('Fees should be number')
            .ariaLabel('Alert Dialog fees should be number')
            .ok('Got it!')
            .targetEvent(ev)
        );
        }
      });
    }

    $scope.removedoctor = function(ev, index){
      var doctors = $scope.doctors.Status.Doctors;
      if(doctors.length < 2){
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Message')
            .textContent('You have to keep at least one doctor')
            .ariaLabel('Alert Dialog delete doctor')
            .ok('Got it!')
            .targetEvent(ev)
        )
      }else{
        var confirm = $mdDialog.confirm()
              .title('Remove Doctor?')
              .textContent('Would you like to remove '+doctors[index].Name+' from '+$scope.clinics[$scope.currentNavItem].Name+'?')
              .ariaLabel('Remove Doctor Confirm')
              .targetEvent(ev)
              .ok('Yes')
              .cancel('No');

        $mdDialog.show(confirm).then(function() {
          Http.data('removefromcommunity', true, function(){
          doctors.splice(index,1);
        }, {ClinicID : $scope.clinics[$scope.currentNavItem].ClinicID, ID : doctors[index].DID});
        });
      }
    }
    $scope.addclinic = function(clinic){
      var config = Config(600, 650, 'templates/panels/clinicpanel.html', Clinic, {clinic : clinic, parentscope : $scope});
      $mdPanel.open(config);
    }
  }
}
