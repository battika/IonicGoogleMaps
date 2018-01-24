(function () {
    "use strict";
    angular.module('driv.geolocationService', [])
       .factory('geoService', geolocationService);

    geolocationService.$inject = ['$cordovaGeolocation', 'ngGPlacesAPI', '$ionicPopup','$rootScope','$q', '$ionicLoading'];

    function geolocationService($cordovaGeolocation, ngGPlacesAPI, $ionicPopup, $rootScope, $q, $ionicLoading) {

        var pos = "";
        var getCurrentPosition = function (posOptions) {
           return $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              return position;
           }, function (error) {
               $ionicLoading.hide();
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: Current Position',
                    template: error.message
                });
            });
        }

        var watchPosition = function (watchPosOptions) {
            var watch;
            var watchOptions = {
                timeout: 5000,
                maximumAge: 3000,
                enableHighAccuracy: true // may cause errors if true
            };

          return $cordovaGeolocation.watchPosition(watchOptions).then(
              null,
              function (err) {
                  var errorPopup = $ionicPopup.alert({
                      title: 'Watch error',
                      template: err
                  });
              },
              function (position) {
                  var lat = position.coords.latitude;
                  var long = position.coords.longitude;
                  console.log('lat long', lat, long);

                  console.log('Latitude: ' + position.coords.latitude + '\n' +
                              'Longitude: ' + position.coords.longitude + '\n' +
                              'Altitude: ' + position.coords.altitude + '\n' +
                              'Accuracy: ' + position.coords.accuracy + '\n' +
                              'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                              'Heading: ' + position.coords.heading + '\n' +
                              'Speed: ' + position.coords.speed + '\n' +
                              'Timestamp: ' + position.timestamp + '\n');
                  return position;                
              });

           // return watch;
           // watch.clearWatch();
        }

        var getAllNearByPlaces = function (ngGPlacesRequest) {
            var d = $q.defer();
            ngGPlacesAPI.nearbySearch(ngGPlacesRequest).then(function (data) {
              //console.log(JSON.stringify(data))
              d.resolve(data);
            },function(error){
                d.reject();
                console.log(error);
            })
            return d.promise;
        }

        return {
            getCurrentPosition: getCurrentPosition,
            watchPosition: watchPosition,
            getAllNearByPlaces: getAllNearByPlaces
        }
    };
})();

