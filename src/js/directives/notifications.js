// notifications directive

angular.module('RxHealth').directive('notifications', ['Http', 'Config', '$http', '$rootScope', '$mdPanel', 'Toast', rdnotification]);
function rdnotification(Http,Config , $http, $rootScope, $mdPanel, Toast){
  function notifunction(scope, element, attrs){
    scope.on = true;
    scope.$watch('on', function(newvalue){
      if(newvalue){
        subscribe();
      }else{
        unsubscribe();
      }
    });
    scope.initialize = function(){
      scope.notifications = Http.data('getnotifications', true, function(v){
        $rootScope.info.badge = v.Status.Count;
      }, {});
    }
    scope.initialize();

    scope.markall = function(){
      Http.data('readnotification', true, function(){
        scope.initialize();
      }, { 'UserID': $rootScope.UserID });
    }

     scope.accrej = function(accept, index){
      var notification = scope.notifications.$data.Status.Notifications[index];
      var options = {NID : notification.NID};

      if(accept){
        options.Accept = 'zeher';
      }
      Http.data('acceptcommunityrequest', true, function(data){
        if(data.Status.ResponseCode == 200){
          notification.Viewed = "#ffffff";
          Http.data('getcommunities', true, angular.noop, {});
        }else{
          Toast(data.Status.ResponseMessage);
        }
      }, options);
      Http.data('viewnotification', true, function(data){
        if(data.Status.ResponseCode == 200){
          if(notification.Viewed == "#f6f6f6"){
            notification.Viewed == "#ffffff";
          }
        }else{
          Toast(data.Status.ResponseMessage);
        }
      }, options);
    }

    scope.opennotification = function(notification){
      Http.data('viewnotification', true, function(){
        if(notification.Viewed == "#f6f6f6"){
          notification.Viewed = "#ffffff";
        }
        switch (notification.Type) {
        case '14':
        case '15':
        case '16':
        case '17':
          var header = {
              'Content-Type': 'application/json ',
              'Accept': 'application/json'
          };
          $http({
              method: 'POST',
              url: 'http://52.24.83.227/getfeeds.php',
              data: {
                UserID : $rootScope.UserID,
                api_key : "5+`C%@>9RvJ'y?8:",
                count : 0,
                ShrID : notification.Extra.ShrID
              },
              headers: header
          }).then(function(v){
            var feed = new Feed(v.data.Status.Articles[0], Http, $mdPanel, Config);
            feed.$detail();
          })
          break;
        case '18':
        case '11':
          break;
      }
      }, {NID : notification.NID});
    }
    scope.stringify = stringify;
  }
  var directive = {
    restrict : "AE",
    templateUrl : 'templates/notifications.html',
    link : notifunction
  }
  return directive;
}
