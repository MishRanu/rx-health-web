
/**
 * Route configuration for the RDash module.
 */
angular.module('RxHealth').config(['$stateProvider', '$urlRouterProvider', configuration]);
function configuration($stateProvider, $urlRouterProvider) {
  window.apprandomurl = Math.floor((Math.random() * 10000000000) + 1).toString();
    // For unmatched routes
    $urlRouterProvider.otherwise('/' + window.apprandomurl);
    // $urlRouterProvider.otherwise('/' + window.apprandomurl + '/home');

    // Application routes
    $stateProvider
        .state('login', {
            url: '/login' + window.apprandomurl,
            templateUrl: 'templates/login.html',
            controller : 'LoginCtrl'
        })
        .state('splash', {
            url: '/' + window.apprandomurl,
            templateUrl: 'templates/splash.html',
            controller : 'SplashCtrl'
        })
        .state('app', {
          url: '/' + window.apprandomurl,
          abstract: true,
          templateUrl: 'templates/app.html'
        })
        .state('app.home', {
            url: '/home',
            views : {
              'appContent' : {
                templateUrl: 'templates/home.html',
                controller : 'HomeCtrl'
              }
            }
        })
        .state('app.adminhome', {
            url: '/adminhome/:CommuID',
            views : {
              'appContent' : {
                templateUrl: 'templates/adminhome.html',
                controller : 'AdminHomeCtrl'
              }
            },
            params : {CommuID : null}
        })
        .state('dxmate', {
          url:'/dxmate' + window.apprandomurl,
          params : {user : null, AID : null, PFID : null, evidence : null},
          templateUrl : 'templates/dxmate.html',
          controller : 'DxCtrl'
        })

        .state('assist', {
          url:'/assistant' + window.apprandomurl,
          templateUrl : 'templates/assistanthome.html',
          controller : 'AssistantCtrl'
        })
        .state('prescription', {
            url: '/prescription' + window.apprandomurl,
            params : {user : null, AID : null, symptoms : null},
            templateUrl: 'templates/prescription.html',
            controller:'PresCtrl'
        })
        .state('app.communities', {
            url: '/communities',
            params : {Tag : null},
            views : {
              'appContent' : {
                templateUrl: 'templates/communities.html',
                controller : 'CommunitiesCtrl'
              }
            }
        })
        .state('app.history', {
            url: '/history',
            views : {
              'appContent' : {
                templateUrl: 'templates/history.html',
                controller : 'HistoryCtrl',
                controllerAs : 'ctrl'
              }
            }
        });
}
