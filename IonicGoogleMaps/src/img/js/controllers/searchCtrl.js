(function () {
    angular.module('driv.searchCtrl', [])
            .controller('searchCtrl', searchCtrl);

    searchCtrl.$inject = ['$scope', '$q', '$timeout', '$rootScope', '$state', '$ionicLoading', '$ionicHistory', 'ionicMaterialMotion', 'ionicMaterialInk', '$ionicPopup', 'googleAdMobService','geoService'];

    function searchCtrl($scope, $q, $timeout, $rootScope, $state, $ionicLoading, $ionicHistory, ionicMaterialMotion, ionicMaterialInk, $ionicPopup, googleAdMobService, geoService) {
        var srchMap;
        var latLng;
        var markersBN = [];

        $scope.$watch(function ($scope) {
            return $scope.chosenPlace
        }, function () {
            if (angular.isDefined($scope.chosenPlace)) {
               // console.log('warch: '+ JSON.stringify($scope.chosenPlace));
            }
        });

        $scope.$on("$ionicView.enter", function () {
              var posOptions = {
                            frequency: 1000,
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
              };

              if ($scope.chosenPlace === undefined) {
                  $scope.btnMapDisable = true;
              }
              geoService.getCurrentPosition(posOptions).then(function (position) {
                  $scope.lat = position.coords.latitude;
                  $scope.long = position.coords.longitude;
              }, function (error) {
                  $ionicLoading.hide();
                  var errorPopup = $ionicPopup.alert({
                      title: 'Error: Get Current Position',
                      template: error.message
                  });
              });
         })

        $scope.$on("$ionicView.beforeLeave", function () {
            //srchMap.clear();
            //srchMap.off();
           // srchMap.trigger("MARKER_REMOVE");
        });

        $scope.showResultInMap = function () {
            if ($scope.chosenPlace !== undefined) {
                $scope.btnMapDisable = false;
                var choisenPlaces = $scope.chosenPlace;
                $rootScope.chosenPlace = choisenPlaces;
                $state.go('app.map');
            }
        }

        var showDialog = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });
            plugin.google.maps.Map.isAvailable(function (isAvailable, message) {
                if (isAvailable) {
                    srchMap = plugin.google.maps.Map.getMap();
                    latLng = new plugin.google.maps.LatLng($rootScope.srchdLat, $rootScope.srchdLong);
                    srchMap.addEventListener(plugin.google.maps.event.MAP_READY, function () {
                        srchMap.setOptions({
                            'backgroundColor': 'white',
                            'mapType': plugin.google.maps.MapTypeId.ROADMAP,
                            'controls': {
                                'compass': true,
                                'myLocationButton': true,
                                'indoorPicker': true,
                                'zoom': true // Only for Android
                            },
                            'gestures': {
                                'scroll': true,
                                'tilt': true,
                                'rotate': true,
                                'zoom': true
                            }
                        });
                        srchMap.animateCamera({
                            'target': latLng,
                            'tilt': 0,
                            'zoom': 13,
                            'bearing': 140,
                            'duration': 3000 // = 5 sec.
                        }, function () {
                        });
                        var prom = getAllBNPlaces();
                        prom.then(function (res) {
                            srchMap.showDialog();
                            addAllMarkers(srchMap);
                            $ionicLoading.hide();
                        })
                    });

                    srchMap.addEventListener(plugin.google.maps.event.MAP_CLOSE, function () {
                        srchMap.clear();
                        srchMap.off();
                        srchMap.trigger("MARKER_REMOVE");
                        srchMap = null;
                    });
                }
            });
        }

        var getAllBNPlaces = function () {
            return $q(function (resolve, reject) {
                for (var i = 0; i < $scope.chosenPlace.length; i++) {
                    var place = $scope.chosenPlace[i];
                    var latMrk = place.geometry.location.lat();
                    var longMrk = place.geometry.location.lng();
                    var latLngMarker = new plugin.google.maps.LatLng(latMrk, longMrk);
                    var mrkrData = {
                        'position': latLngMarker,
                        'icon': 'www/img/Stasjon.png',
                        'title': place.name,
                        'snippet': place.vicinity,
                        'disableAutoPan': true,
                        'animation': plugin.google.maps.Animation.BOUNCE,
                        'infoClick': function (marker) {
                            var reference = place.reference;
                            marker.hideInfoWindow();
                            $state.go('app.gastStationDetails', { ref: reference });
                            srchMap.closeDialog();
                        }
                    };
                    markersBN.push(mrkrData);
                }
                resolve(markersBN);
            }, function (sender, args) {
                reject(args.get_message());
            });
        }

        var addAllMarkers = function (srchMap) {
            addMarkers(markersBN, function (markers) {
                // markers[markers.length - 1].showInfoWindow();
            });

            function addMarkers(data, callback) {
                var markers = [];
                function onMarkerAdded(marker) {
                    markers.push(marker);
                    if (markers.length === data.length) {
                        callback(markers);
                    }

                    srchMap.addEventListenerOnce("MARKER_REMOVE", function () {
                        marker.remove();
                    });

                    marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
                        marker.showInfoWindow();
                    });

                }
                data.forEach(function (markerOptions) {
                    srchMap.addMarker(markerOptions, onMarkerAdded);
                });
            }
        }

        //$timeout(function () {
        //    $scope.isExpanded = false;
        //    $scope.$parent.setExpanded(false);
        //    ionicMaterialMotion.fadeSlideInRight();
        //    ionicMaterialInk.displayEffect();
        //}, 0);
        ionicMaterialMotion.fadeSlideInRight();
        ionicMaterialInk.displayEffect();

         $rootScope.$ionicGoBack = function () {
           $ionicHistory.goBack();
        };
    }
})();