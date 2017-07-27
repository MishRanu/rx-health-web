/**
 * Palette configuration for the RxHealth module.
 */
angular.module('RxHealth').config(['$mdThemingProvider', '$resourceProvider', 'cfpLoadingBarProvider', '$httpProvider', palette]);
function palette($mdThemingProvider, $resourceProvider, cfpLoadingBarProvider, $httpProvider){
  $mdThemingProvider.definePalette('amazingPaletteName', {
    '50': 'ffffff',
    '100': 'ffffff',
    '200': 'ffffff',
    '300': 'ffffff',
    '400': 'ffffff',
    '500': 'ffffff',
    '600': 'ffffff',
    '700': 'ffffff',
    '800': 'ffffff',
    '900': 'ffffff',
    'A100': 'ffffff',
    'A200': 'ffffff',
    'A400': 'ffffff',
    'A700': 'ffffff',
    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                        // on this palette should be dark or light
    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
     '200', '300', '400', 'A100'],
    'contrastLightColors': undefined    // could also specify this if default was 'dark'
  });
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange')
    .warnPalette('red');
    $resourceProvider.defaults.cancellable = true;

    $mdThemingProvider.theme('cardTheme')
    .backgroundPalette('amazingPaletteName');

    cfpLoadingBarProvider.includeSpinner = false;
    var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
      return {
        'responseError': function (rejection) {
          return $q.reject(rejection);
        }
      };
    }];
    $httpProvider.interceptors.push(interceptor);
}
