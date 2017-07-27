/**
 * Module defination for the RxHealth module.
 */
 var GCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';
 const applicationServerPublicKey = 'BE-WZDUw8F296jQl-h4PXiuMy5wUBTph4OfONKEcjQubekfMMPJO1lK2WKcObDrEdxi1QHpS0PWjLBaDA18AFuk';

function urlB64ToUint8Array(base64String) {
 var padding = '='.repeat((4 - base64String.length % 4) % 4);
 var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
 var rawData = window.atob(base64);
 var outputArray = new Uint8Array(rawData.length);

 for(var i = 0; i < rawData.length; ++i) {
   outputArray[i] = rawData.charCodeAt(i);
 }
 return outputArray;
}

function endpointWorkaround(pushSubscription) {
 // Make sure we only mess with GCM
 if (pushSubscription.endpoint.indexOf(GCM_ENDPOINT) !== 0) {
   return pushSubscription.endpoint;
 }

 var mergedEndpoint = pushSubscription.endpoint;
 // Chrome 42 + 43 will not have the subscriptionId attached
 // to the endpoint.
 if (pushSubscription.subscriptionId &&
   pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
   // Handle version 42 where you have separate subId and Endpoint
   mergedEndpoint = pushSubscription.endpoint + '/' +
     pushSubscription.subscriptionId;
 }
 return mergedEndpoint;
}

function sendSubscriptionToServer(subscription) {
 // TODO: Send the subscription.endpoint
 // to your server and save it to send a
 // push message at a later date
 //
 // For compatibly of Chrome 43, get the endpoint via
 // endpointWorkaround(subscription)
 console.log('TODO: Implement sendSubscriptionToServer()', JSON.stringify(subscription));

 var mergedEndpoint = endpointWorkaround(subscription);

 // This is just for demo purposes / an easy to test by
 // generating the appropriate cURL command
 var temp = showCurlCommand(mergedEndpoint);
 return temp;
}

// NOTE: This code is only suitable for GCM endpoints,
// When another browser has a working version, alter
// this to send a PUSH request directly to the endpoint
function showCurlCommand(mergedEndpoint) {
// The curl command to trigger a push message straight from GCM
if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
 console.warn('This browser isn\'t currently ' +
   'supported for this demo');
 return;
}

 var endpointSections = mergedEndpoint.split('/');
 var subscriptionId = endpointSections[endpointSections.length - 1];

 return subscriptionId;
}

function initialiseState() {
	// Are Notifications supported in the service worker?
	if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
	 console.warn('Notifications aren\'t supported.');
	 return;
	}

	// Check the current Notification permission.
	// If its denied, it's a permanent block until the
	// user changes the permission
	if (Notification.permission === 'denied') {
	 console.warn('The user has blocked notifications.');
	 return;
	}

	// Check if push messaging is supported
	if (!('PushManager' in window)) {
	 console.warn('Push messaging isn\'t supported.');
	 return;
	}
  var prom = new Promise(function(resolve, reject) {
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
  		// Do we already have a push message subscription?
  		serviceWorkerRegistration.pushManager.getSubscription()
  			.then(function(subscription) {
  				// Enable any UI which subscribes / unsubscribes from
  				// push messages.
  				// var pushButton = document.querySelector('.js-push-button');
  				// pushButton.disabled = false;

  				if (!subscription) {
  					// We aren’t subscribed to push, so set UI
  					// to allow the user to enable push
            subscribe();
  					return;
  				}

  				// Keep your server in sync with the latest subscription
          var temp = sendSubscriptionToServer(subscription);
          if(temp){
            resolve(temp);
          }else{
            reject("Oops!")
          }

  				// Set your UI to show they have subscribed for
  				// push messages
  				// pushButton.textContent = 'Disable Push Messages';
  				// isPushEnabled = true;
  			})
  			.catch(function(err) {
  				console.error('Error during getSubscription()', err);
          reject(err);
  			});
  	});
  });
  return prom;
}

function unsubscribe() {
 // var pushButton = document.querySelector('.js-push-button');
 // pushButton.disabled = true;

 navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
   // To unsubscribe from push messaging, you need get the
   // subcription object, which you can call unsubscribe() on.
   serviceWorkerRegistration.pushManager.getSubscription().then(
     function(pushSubscription) {
       // Check we have a subscription to unsubscribe
       if (!pushSubscription) {
         // No subscription object, so set the state
         // to allow the user to subscribe to push
        //  isPushEnabled = false;
        //  pushButton.disabled = false;
        //  pushButton.textContent = 'Enable Push Messages';
         return;
       }

       // TODO: Make a request to your server to remove
       // the users data from your data store so you
       // don't attempt to send them push messages anymore

       // We have a subcription, so call unsubscribe on it
       pushSubscription.unsubscribe().then(function() {
        //  pushButton.disabled = false;
        //  pushButton.textContent = 'Enable Push Messages';
        //  isPushEnabled = false;
       }).catch(function(e) {
         // We failed to unsubscribe, this can lead to
         // an unusual state, so may be best to remove
         // the subscription id from your data store and
         // inform the user that you disabled push

         console.log('Unsubscription error: ', e);
        //  pushButton.disabled = false;
       });
     }).catch(function(e) {
       console.error('Error thrown while unsubscribing from ' +
         'push messaging.', e);
     });
 });
}

function subscribe() {
 // Disable the button so it can't be changed while
 // we process the permission request
 // var pushButton = document.querySelector('.js-push-button');
 // pushButton.disabled = true;

 navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
   const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
   serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: applicationServerKey})
     .then(function(subscription) {
       console.log(subscription);
       // The subscription was successful
      //  isPushEnabled = true;
      //  pushButton.textContent = 'Disable Push Messages';
      //  pushButton.disabled = false;

       // TODO: Send the subscription subscription.endpoint
       // to your server and save it to send a push message
       // at a later date
       return sendSubscriptionToServer(subscription);
     })
     .catch(function(e) {
       if (Notification.permission === 'denied') {
         // The user denied the notification permission which
         // means we failed to subscribe and the user will need
         // to manually change the notification permission to
         // subscribe to push messages
         console.log('Permission for Notifications was denied');
        //  pushButton.disabled = true;
       } else {
         // A problem occurred with the subscription, this can
         // often be down to an issue or lack of the gcm_sender_id
         // and / or gcm_user_visible_only
         console.log('Unable to subscribe to push.', e);
        //  pushButton.disabled = false;
        //  pushButton.textContent = 'Enable Push Messages';
       }
     });
 });
}

function stringify(seconds){
	var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years ago";
  }else if(interval == 1){
    return interval + " year ago";
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }else if(interval == 1){
    return interval + " month ago";
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }else if(interval == 1){
    return interval + " day ago";
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }else if(interval == 1){
    return interval + " hour ago";
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes ago";
  }else if(interval == 1){
    return interval + " minute ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

angular.module('RxHealth', ['ui.router', 'ngCookies','ngMaterial', 'ngResource', 'ngAnimate', 'ngAria', 'ngMessages', 'ngSanitize', 'ckeditor', 'angular-loading-bar']).run(['$rootScope', '$state', '$cookieStore','$mdPanel', '$window', '$http', 'Http', 'Config', run]);

function run($rootScope, $state, $cookieStore, $mdPanel, $window, $http, Http, Config){
  var search = ($window.location.search)?JSON.parse('{"' + decodeURI($window.location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'):{};
	var temp = $cookieStore.get('UserID');
	angular.element(document).ready(function(){
    if(search.shrid && !isNaN(search.shrid)){
      var header = {
          'Content-Type': 'application/json ',
          'Accept': 'application/json'
      };
      $http({
          method: 'POST',
          url: 'http://dxhealth.esy.es/RxHealth0.1/getfeeds.php',
          data: {
            UserID : $rootScope.UserID,
            api_key : "5+`C%@>9RvJ'y?8:",
            count : 0,
            ShrID : Number(search.shrid)
          },
          headers: header
      }).then(function(v){
        var feed = new Feed(v.data.Status.Articles[0], Http, $mdPanel, Config, undefined, true);
        feed.$detail();
      })
    }
    if (search.type && !isNaN(search.type) && Number(search.type) < 3) {
      $rootScope.info.type = Number(search.type);
    }else{
      $rootScope.info.type = 3;
    }
    if(temp){
      $rootScope.UserID = temp;
      $state.go('app.home');
    }
	});
  $rootScope.info = { name :'RxHealth', current : 'home'};
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    $rootScope.info.current = toState.name.substring(toState.name.indexOf(".")+1,toState.name.length);
  });
	var [width,height] = [(document.documentElement.clientWidth > 500)?500:document.documentElement.clientWidth,
    (document.documentElement.clientHeight > 500)?500:document.documentElement.clientHeight
  ];
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
  $rootScope.obj = {
    width : width + "px",
    height : height + "px"
  }
	$rootScope.panelconfig = {
    animation : animation,
    attachTo: angular.element(document.body),
    controllerAs: 'ctrl',
    hasBackdrop: true,
    panelClass: 'flex-initial',
    position: position,
    trapFocus: true,
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: true,
    locals : {
      obj : $rootScope.obj
    }
  };
}
