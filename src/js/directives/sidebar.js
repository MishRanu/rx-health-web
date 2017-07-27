// sidebar directive

angular.module('RxHealth').directive('sidebar',['$rootScope', '$mdSidenav', '$state', 'Config', '$mdPanel', 'Http', 'Toast', rdsidebar]);
function rdsidebar($rootScope, $mdSidenav, $state, Config, $mdPanel, Http, Toast){
  function sidefunction(scope, element, attrs){
    scope.closeSidebar = function(it){
      if(it){
        $state.go(it.href, it.params);
      }
      $mdSidenav('left')
       .close();
    }
    scope.info = $rootScope.info;
    if($rootScope.info.type == 2){
      scope.sidebar = [];
      Http.data('getcommunities', false, function(v){
        for(let community of v.Status.myCommunities){
          scope.sidebar.push({Name : community.Name, href : "app.adminhome", params : {CommuID : community.CommuID}});
        }
      }, {});
    }else{
      scope.sidebar = [{
        Name : 'Home',
        href : "app.home"
      },{
        Name : 'Communities',
        href : "app.communities"
      },{
        Name : 'History',
        href : "app.history"
      }];
    }
    scope.show = function(what){
      var conf = Config(500, 600, 'templates/panels/'+ what +'.html', angular.noop, {});
      conf.zIndex = 150;
      $mdPanel.open(conf);
    }
    scope.sendreq = function(){
      Http.data('createcommunityrequest', true, function(){
        Toast('Community Request Sent');
        scope.closeSidebar();
      }, {});
    }
  }
  var directive = {
    restrict : "AE",
    templateUrl : 'templates/sidebar.html',
    link : sidefunction
  }
  return directive;
}
