angular.module('driv.searchDirective', [])
    .directive('googleplace', ['$timeout', '$rootScope', '$q', '$ionicLoading', '$cordovaGeolocation', 'ngAzureService', 'backAndService', 'geoService',
        function ($timeout, $rootScope, $q, $ionicLoading, $cordovaGeolocation, ngAzureService, backAndService, geoService) {
            return {
                require: '?ngModel',
                scope: {
                    ngModel: '=?',
                    details: '=?'
                },
                link: function (scope, element, attrs, ngModel) {
                    scope.locations = {};

                    var places = [];
                    var promise1;
                    var promise2;
                    var mylatLng;
                    var latitude;
                    var longitude;
                    scope.lat = "";
                    scope.long = "";
                    var countryRestrict = { 'country': 'no' };

                    var posOptions = {
                        frequency: 1000,
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    };

                    var options = {
                        types: ['geocode'],
                        componentRestrictions: countryRestrict
                    };

                    var autocomplete = scope.gPlace;
                    autocomplete = new google.maps.places.Autocomplete(element[0], options);

                    autocomplete.addListener('place_changed', onPlaceChanged);

                    geoService.getCurrentPosition(posOptions).then(function (position) {
                        scope.lat = position.coords.latitude;
                        scope.long = position.coords.longitude;
                    }, function (error) {
                        $ionicLoading.hide();
                        var errorPopup = $ionicPopup.alert({
                            title: 'Error: Get Current Position',
                            template: error.message
                        });
                    })

                    mylatLng = new plugin.google.maps.LatLng(scope.lat, scope.long);
                    function onPlaceChanged() {
                        $ionicLoading.show({
                            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                            content: 'Laster opp kart...',
                            showBackdrop: false
                        });

                        var result = autocomplete.getPlace();
                        if (result !== undefined) {
                            scope.$apply(function () {
                                latitude = result.geometry.location.lat();
                                longitude = result.geometry.location.lng();

                                var pyrmont = new plugin.google.maps.LatLng(latitude, longitude);
                                var request = {
                                    location: pyrmont,
                                    radius: '5000',
                                    types: ['gas_station']
                                };
                                var service = new google.maps.places.PlacesService(element[0]);
                                service.nearbySearch(request, function (results, status) {
                                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                                        places = [];
                                        if (results.length != null) {
                                            for (var i = 0; i < results.length; i++) {
                                                var place = results[i];
                                                setImageName(place.name, place);
                                                promise1 = calculateDistances(place, place.geometry);
                                                promise2 = getPrices(place.place_id, place);
                                                places.push(place);
                                            }

                                            $q.all(promise1, promise2).then(function () {
                                                $timeout(function () {
                                                    $rootScope.srchdLat = latitude;
                                                    $rootScope.srchdLong = longitude;
                                                    $ionicLoading.hide();
                                                    $rootScope.searchedPlaces = places;
                                                    ngModel.$setViewValue(places);
                                                }, 1000)
                                            });
                                        }
                                    }
                                    else {
                                        place = [];
                                        ngModel.$setViewValue(places);
                                        $ionicLoading.hide();
                                    }
                                });
                            });
                        }
                    }

                    var calculateDistances = function (place, geometry) {
                        var deferred = $q.defer();
                        return $q(function (resolve, reject) {
                            var mylatLng = new plugin.google.maps.LatLng(scope.lat, scope.long);
                            var service = new google.maps.DistanceMatrixService();
                            var latitude = geometry.location.lat();
                            var longitude = geometry.location.lng();
                            var destLatLng = new plugin.google.maps.LatLng(latitude, longitude);
                            place.distance = "";
                            service.getDistanceMatrix(
                                {
                                    origins: [mylatLng],
                                    destinations: [destLatLng],
                                    travelMode: google.maps.TravelMode.DRIVING,
                                    unitSystem: google.maps.UnitSystem.METRIC,
                                    avoidHighways: false,
                                    avoidTolls: false
                                }, callback);

                            function callback(response, status) {
                                if (status === google.maps.DistanceMatrixStatus.OK) {
                                    var dist = response.rows[0].elements[0].distance.text;
                                    place.distance = dist;
                                }
                            }
                            deferred.resolve(place);
                            return deferred.promise;
                        }, function (sender, args) {
                            deferred.reject(args.get_message());
                        });
                    }

                    var getPrices = function (placeid, place) {
                        var deferred = $q.defer();
                        return $q(function (resolve, reject) {
                            backAndService.getPrices(placeid).then(function (response) {
                                angular.forEach(response.data, function (value, key) {
                                    if (value.type === "Blyfri95") {
                                        place.B95 = value.price;
                                    }
                                    if (value.type === "Blyfri98") {
                                        place.B98 = value.price;
                                    }
                                    if (value.type === "Diesel") {
                                        place.D = value.price;
                                    }
                                });
                                deferred.resolve(place);
                            });
                        }, function (sender, args) {
                            deferred.reject(args.get_message());
                        })
                        return deferred.promise;
                    }

                    function setImageName(name, place) {
                        var str = name;
                        var Circle = str.match(/Circle/gi);
                        var Statoil = str.match(/Statoil/gi);
                        var smCircle = str.match(/circle/gi);

                        var Shell = str.match(/Shell/gi);
                        var ShellL = str.match(/SHELL/gi);
                        var Esso = str.match(/Esso/gi);
                        var Deli = str.match(/Deli/gi);
                        var essosm = str.match(/esso/gi);
                        var St1 = str.match(/St1/gi);
                        var s123 = str.match(/3/gi);
                        var UnoX = str.match(/Uno-X/gi);
                        var YX = str.match(/YX/gi);
                        var best = str.match(/Best/gi);
                        var eco1 = str.match(/Eco-1/gi);
                        var eco11 = str.match(/Eco- 1/gi);
                        var bunker = str.match(/Bunker Oil/gi);
                        var tanken = str.match(/Tanken/gi);
                        var tanke = str.match(/Tanke/gi);

                        if (Circle !== null) {
                            if (Circle == "Circle" || smCircle == "circle") {
                                place.mimg = "";
                                place.mimg = "../img/" + Circle + ".png";
                            }
                        }

                        else if (best !== null) {
                            if (best == "Best") {
                                place.mimg = "";
                                place.mimg = "../img/" + best + ".png";
                            } 
                        }
                        else if (YX !== null) {
                            if (YX == "YX") {
                                place.mimg = "";
                                place.mimg = "../img/" + YX + ".png";
                            }
                        }
                        else if (Esso !== null || Deli != null) {
                            if (Esso == "Esso") {
                                place.mimg = "../img/" + Esso + ".png";
                            }
                            if (Deli == "Deli"){
                                place.mimg = "../img/deli.png";
                            }
                        }
                        else if (essosm !== null) {
                            if (essosm == "esso") {
                                place.mimg = "../img/" + essosm + "sm.png";
                            }
                        }
                        else if (Shell !== null && ShellL !== null) {
                            if (Shell == "Shell" || ShellL == "SHELL") {
                                place.mimg = "";
                                place.mimg = "../img/Shell.png";
                            }
                        }
                        else if (St1 !== null) {
                            if (St1 == "St1") {
                                place.mimg = "";
                                place.mimg = "../img/" + St1 + ".png";
                            }                          
                        }
                        else if (s123 !== null) {
                            if (s123 == "3") {
                                place.mimg = "";
                                place.mimg = "../img/entotre.png";
                            }
                        }
                        else if (UnoX !== null) {
                            if (UnoX == "Uno-X") {
                                place.mimg = "";
                                place.mimg = "../img/" + UnoX + ".png";
                            }
                        }
                        else if (eco1 !== null) {
                            if (eco1 == "Eco-1" || eco1 == "eco-1" || eco1 == "eco1" || eco1 == "eco- 1") {
                                place.mimg = "";
                                place.mimg = "../img/" + eco1 + ".png";
                            }
                        }
                        else if (tanken !== null) {
                            if (tanken == "Tanken" || tanke == "Tanke") {
                                place.mimg = "";
                                place.mimg = "www/img/tanken.png";
                            }
                        }
                        else if (bunker !== null) {
                            if (bunker == "Bunker Oil") {
                                place.mimg = "";
                                place.mimg = "www/img/bunker.png";
                            }                          
                        }
                        else {
                            place.mimg = "";
                            place.mimg = "../img/Fuel.png";
                        }
                    }

                    $timeout(function () {                      
                        container = document.getElementsByClassName('pac-container');
                        angular.element(container).attr('data-tap-disabled', 'true');
                        var backdrop = document.getElementsByClassName('backdrop');
                        angular.element(backdrop).attr('data-tap-disabled', 'true');

                        // leave input field if google-address-entry is selected
                        angular.element(container).on("click", function () {
                            document.getElementById('pac-input').blur();
                            //document.getElementById('type-selector').blur();
                            $('body').on('touchend', '.pac-container', function (e) { e.stopImmediatePropagation(); })
                        });
                    }, 500);
                }
            }
        }
    ]);