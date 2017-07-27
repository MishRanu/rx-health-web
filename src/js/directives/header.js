// header directive

angular.module('RxHealth').directive('header', ['$rootScope', '$mdSidenav', '$http', 'Http', 'Config', '$mdPanel', '$state', rdheader]);
function rdheader($rootScope, $mdSidenav, $http, Http, Config, $mdPanel, $state){
  function headfunction(scope, element, attrs){
    scope.toggle = function(){
      $mdSidenav('left')
       .toggle();
    }
    scope.info = $rootScope.info;
    scope.items = ["settings","profile","notifications"]
    scope.searchTextChange = function(str) {
        var header = {
            'Content-Type': 'application/json ',
            'Accept': 'application/json'
        };

        return $http({
                method: 'POST',
                url: 'http://52.24.83.227/search.php',
                data: {
                    'Data': str,
                    'api_key' : "5+`C%@>9RvJ'y?8:",
                    'IsDoctor' : 1
                },
                headers: header
            })
            .then(function(response) {
                scope.querylist = [];
                for (var i = 0; i < response.data.Status.Result.Communities.length; i++) {
                    scope.querylist.push(response.data.Status.Result.Communities[i]);
                }
                for (var i = 0; i < response.data.Status.Result.People.length; i++) {
                    scope.querylist.push(response.data.Status.Result.People[i]);
                }
                for (var i = 0; i < response.data.Status.Result.Tags.length; i++) {
                    scope.querylist.push(response.data.Status.Result.Tags[i]);
                }
                return scope.querylist;
            });

    }
    scope.setModelSymptom = function(item) {
        if(scope.selectedItem){
          if(scope.selectedItem.CommuID){
            Http.data('getcommunitydetails', true, function(community){
              Http.data('getconnections', true, function(v){
                var conf = Config(600, 600, 'templates/panels/communitypanel.html', Community, {
                  detail : community,
                  people : v
                });
                if(community.Status.DID == $rootScope.UserID){
                  conf.locals.neymar = true;
                  conf.locals.suarez = false;
                }
                $mdPanel.open(conf);
                scope.selectedItem = undefined;
              }, {CommuID : item.CommuID, require : ['connection', 'follower']});
            }, {CommuID : item.CommuID});
          }else if (scope.selectedItem.UserID) {
            Http.data('getuserprofile', true, function(v){
              var conf = Config(500, 500, 'templates/panels/patientprofilepanel.html', UserProfile, {
                profile : v,
                selectedtab : 0
              });
              $mdPanel.open(conf);
              scope.selectedItem = undefined;
            }, {ID : item.UserID});
          }else if (scope.selectedItem.TagID) {
            $state.go('app.communities', {Tag : scope.selectedItem.Name});
            scope.selectedItem = undefined;
          }
        }
    }
  }
  var directive = {
    restrict : "AE",
    templateUrl : 'templates/header.html',
    link : headfunction
  }
  return directive;
}
