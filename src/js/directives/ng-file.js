angular.module('RxHealth').directive('ngFiles', ['$parse', '$rootScope', '$http', parse ]);

function parse($parse, $rootScope, $http) {
    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
          angular.forEach(event.target.files, function (value, key) {
            let formdata = new FormData();
            formdata.append('SelectedFile', value);
            formdata.append("UserID", $rootScope.UserID);
            var request = {
             method: 'POST',
             url: 'http://52.24.83.227/uploadarticle2.php',
             data: formdata,
             headers: {
                 'Content-Type': undefined
             }
            };
            var promise = new Promise(function(resolve, reject){
              $http(request).then(function (response) {
                resolve(response.data);
              }, function () {
                reject("shit");
              });
            });
            onChange(scope, {$files : promise});
          });
        });
    };
    return {
        link: fn_link
    }
}
