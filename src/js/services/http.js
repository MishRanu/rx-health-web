/**
 * Http service defination for the RxHealth module.
 * Use Http.data(url-name, fromserver(if should get updated value from server), successcallback, params, extras)
 */
angular.module('RxHealth')
.factory('Http', ['$resource', '$rootScope', 'Toast', httpfunction])
.factory('Config', ['$mdPanel', configgen])
.factory('Toast', ['$mdToast', toastgen]);

function toastgen($mdToast){
  var toastPosition = angular.extend({},last);
  var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

  function getToastPosition() {
    sanitizePosition();
    return Object.keys(toastPosition)
      .filter(function(pos) { return toastPosition[pos]; })
      .join(' ');
  };

  function sanitizePosition() {
    var current = toastPosition;

    if ( current.bottom && last.top ) current.top = false;
    if ( current.top && last.bottom ) current.bottom = false;
    if ( current.right && last.left ) current.left = false;
    if ( current.left && last.right ) current.right = false;

    last = angular.extend({},current);
  }

   function showSimpleToast(text, duration) {
    var pinTo = getToastPosition();
    $mdToast.show(
      $mdToast.simple()
        .textContent(text)
        .position(pinTo )
        .hideDelay((duration)?duration:2000)
    );
  };

  return showSimpleToast;
}

function configgen($mdPanel){
  var obj = {};
  var config = {
    attachTo: angular.element(document.body),
    controllerAs: 'ctrl',
    hasBackdrop: true,
    panelClass: 'flex-initial',
    trapFocus: true,
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true
  };
  function generateit(w, h, templateurl, controller, locals){
    // var width = (document.documentElement.clientWidth > w)?w:document.documentElement.clientWidth;
    // var height = (document.documentElement.clientHeight > h)?h:document.documentElement.clientHeight;
    var width = Math.round(document.documentElement.clientHeight*0.85);
    var height = Math.round(document.documentElement.clientHeight*0.85);
    obj = {height : height + "px", width : width + "px"};
    var position = $mdPanel.newPanelPosition()
      .absolute()
      .center();
    var animation = $mdPanel.newPanelAnimation().openFrom({
        top: -height,
        left: (document.documentElement.clientWidth-width)/2
      }).closeTo({
          top : -height,
          left: (document.documentElement.clientWidth-width)/2
      }).withAnimation($mdPanel.animation.SLIDE);
    config.locals = locals;
    config.locals.obj = obj;
    config.animation = animation;
    config.position = position;
    config.templateUrl = templateurl;
    config.controller = controller;
    return config;
  }
  return generateit;
}

function httpfunction($resource, $rootScope, Toast) {
  var [datam,extras,Data,errorcallback,get,post,data,customerr] = [{},{},
  $resource('http://52.24.83.227/:name.php',{ name : 'test'}),
  // $resource('http://dxhealth.esy.es/RxHealth0.1/:name.php',{ name : 'test'}),
  err => {
    var temp = err.config.url.substring(err.config.url.lastIndexOf("/") + 1,err.config.url.lastIndexOf("."));
    if(err.status == -1){
      Toast("Please Check Your Internet Connection");
    }
    customerr();
    delete datam[temp];
  },
  (name, successcallback = angular.noop)  => {
    return Data.get({name},successcallback,errorcallback);
  },
  (name, params, successcallback = angular.noop)  => {
    if(!params){
      params = {};
    }
    if($rootScope.UserID){
      if($rootScope.info.type == 1){
        params.ClinicID = $rootScope.UserID;
      }else{
        params.UserID = $rootScope.UserID;
      }
    }
    params.api_key = "5+`C%@>9RvJ'y?8:";
    // console.warn(name,JSON.stringify(params));
    return Data.save({name},params,successcallback,errorcallback);
  },
  (name, fromserver, ...args) => {
      if(!datam[name]){
        datam[name] = {};
        fromserver = true;
      }
      if(fromserver){
        if(!args[2] && datam[name]){
          var extra = datam[name].$extra;
        }
        if(args[1]){
          datam[name].$data = post(name, args[1],args[0]);
        }else{
          datam[name].$data = get(name, args[0]);
        }
        if(args[2]){
          datam[name].$extra = args[2];
        }else{
          datam[name].$extra = extra;
        }
      }else{
        if(args[0]){
          args[0](datam[name].$data);
        }
      }
      if(args[3]){
        customerr = args[3];
      }else{
        customerr = angular.noop;
      }
      return datam[name];
    },
    angular.noop
];

  return {data};
};
