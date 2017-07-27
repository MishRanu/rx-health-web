// splash contrller
angular.module('RxHealth').controller('SplashCtrl',['$state', '$scope', '$rootScope','$mdPanel', 'Toast', 'Http', '$cookieStore', '$http', 'Config', splash]);

function splash($state, $scope, $rootScope, $mdPanel, Toast, Http, $cookieStore, $http, Config){
  $scope.logintype = $rootScope.info;
    var [width,height] = [(document.documentElement.clientWidth > 500)?500:document.documentElement.clientWidth,
    (document.documentElement.clientHeight > 500)?500:document.documentElement.clientHeight
  ];

$scope.enter = function(e){
  if (e.keyCode == 13) {
    document.getElementById("myForm").submit();
  }
}

$scope.login = function(user) {
  var link = ($scope.logintype.type == 1)?'assistentlogin':'signin-main';
  if ((user.phone || user.username) && user.password) {
    // initialiseState().catch(function(err) {
    //   console.error(Error(err));
    // })
    Promise.resolve("blah").then(function(res){
      var options = {
        'Password' : user.password,
        'RegistrationID' : res
      }
      if($scope.logintype.type == 1){
        options.UserName = user.username;
      }else{
        options.Phone = user.phone.toString();
      }
      if($scope.logintype.type == 2){
        options.admin = true;
      }
      Http.data(link,true, function(v){
       if (v.Status.ResponseCode == 200){
         $rootScope.IsLoggedIn = true;
         if($scope.logintype.type > 1){
           $rootScope.UserID = v.Status.UserID;
           if($scope.remember){
             $cookieStore.put('UserID',$rootScope.UserID);
           }
           if($scope.logintype.type == 3){
             $state.go('app.home');
           }else{
             Http.data('getcommunities', false, function(v){
                $state.go('app.adminhome', { CommuID : v.Status.myCommunities[0].CommuID});
             }, {});
           }
         }else{
           $rootScope.UserID = v.Status.ClinicID;
           $state.go('assist');
         }
       }else{
         Toast(v.Status.ResponseMessage);
       }
     },options);
    })
   }
 }

// Panels {signup and forgot password}

$scope.signup = function(user) {
  $scope.signupopened = true;
  var config = Config(600,600,'templates/panels/signup.html',Signup,{
    obj : $scope.Object,
    messi : true,
    showtoast : Toast
  });
      Http.data('council', false, function(v){
        config.locals.council = v.Status.Council;
        $mdPanel.open(config);
        $scope.signupopened = false;
      },{},{}, function() {
        $scope.signupopened = false;
      });
  }


$scope.forgotpass = function(user) {
    var config = Config(600, 250, 'templates/panels/forgotpassword.html', forgotpass, {
      obj : $scope.Object,
       messi : true,
       ronaldo : false,
       showtoast : Toast
    });
    $mdPanel.open(config);
  }
}
