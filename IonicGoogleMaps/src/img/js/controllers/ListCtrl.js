(function () {
    angular.module('driv.ListCtrl', [])
        .controller('ListCtrl', ListCtrl);

    ListCtrl.$inject = ['$scope', '$q', '$rootScope', '$state', '$filter', '$window', '$ionicLoading', '$ionicHistory', '$ionicPopup', '$timeout', 'ionicMaterialMotion', 'ionicMaterialInk', 'ngAzureService', 'backAndService', 'geoService', 'nobilCSService','ngDialog'];

    function ListCtrl($scope, $q, $rootScope, $state, $filter, $window, $ionicLoading, $ionicHistory, $ionicPopup, $timeout, ionicMaterialMotion, ionicMaterialInk, ngAzureService, backAndService, geoService, nobilCSService, ngDialog) {
        var latLng;
        var gPlace = [];
        var ldPlaces = [];
        var plcs = [];
        var promise1;
        var promise2;

        var posOptions = {
            frequency: 1000,
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        $scope.places = [];
        $scope.placesBG = [];

        $scope.Eplaces = [];
        $scope.EplacesBG = [];

        $scope.search = '';
        $scope.showUserIconD = false

        $scope.choiceB = false;
        $scope.choiceL = false;
        $scope.choiceBG = false;
        $scope.showInfoBtn = false;
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');

        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
            content: 'Laster opp...',
            showBackdrop: false
        });

        $scope.$on("$ionicView.enter", function () {
            try {
                if ($rootScope.data !== null && $rootScope.data !== undefined) {
                    if ($rootScope.data.value === 'BN') {
                        $scope.choiceB = true;
                        $scope.choiceL = false;
                        $scope.choiceBG = false;

                        $scope.showInfoBtn = false;
                        initList();
                        $timeout(function () {
                            $ionicLoading.hide();
                        }, 700);
                    }
                    if ($rootScope.data.value === 'LD') {
                        $scope.choiceB = false;
                        $scope.choiceBG = false;
                        $scope.choiceL = true;
                        $scope.showInfoBtn = true;
                        initList();
                        $timeout(function () {
                            $ionicLoading.hide();
                        }, 700);
                    }
                    if ($rootScope.data.value === 'BG') {
                        $scope.choiceB = false;
                        $scope.choiceL = false;
                        $scope.choiceBG = true;
                        $scope.showInfoBtn = true;
                        initList();
                        $timeout(function () {
                            $ionicLoading.hide();
                        }, 700);
                    }
                }
            }
            catch (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error: List',
                    template: error.message
                });
            }
        });

        $scope.$on("$ionicView.afterLeave", function () {
            // $ionicHistory.clearCache();
            //$ionicHistory.clearHistory();
            //googleAdMobService.removeBanner();
        });

        $scope.moveItem = function (item, fromIndex, toIndex) {
            $scope.items.splice(fromIndex, 1);
            $scope.items.splice(toIndex, 0, item);
        };

        $scope.addPlacesImages = function (csImage) {
            $scope.csImg = "";
            var img = csImage;
            if (img === 'Kommer' || img === 'no.image.svg' || img === 'no.image.swg' || img === '' || img === null || img === undefined) {
                $scope.csImg = 'data:image/png;base64,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';
            }
            if (img !== 'Kommer' && img !== 'no.image.svg' && img !== 'no.image.swg' && img !== '' && img !== null && img !== undefined) {
                $scope.csImg = 'http://www.nobil.no/img/ladestasjonbilder/' + img;
            }
        }

        $scope.refresh = function () {
            $state.reload();
        }

        $scope.showInfo = function () {
            ngDialog.open({
                template: 'templates/infoModal.html',
                className: 'ngdialog-theme-default',
                preCloseCallback: function (value) {
                   
                }
            });
        }

        $scope.selectFilter = function () {
            ngDialog.open({
                template: 'templates/selectFilterModal.html',
                controller: 'selectFilterModal',
                className: 'ngdialog-theme-default',
                preCloseCallback: function (item) {
                    if (item !== null && item !== undefined) {
                        if (item.value === 'All') {
                            if ($rootScope.data.value === 'LD') {
                                $scope.Eplaces = ldPlaces;
                            }
                            if ($rootScope.data.value === 'BG') {
                                $scope.EplacesBG = ldPlaces;
                            }
                        }
                        else {
                            if ($rootScope.data.value === 'LD') {
                                $scope.Eplaces = ldPlaces;
                                var filterLD = $filter('listELSearchFilter')($scope.Eplaces, item.value);
                                $scope.Eplaces = filterLD;
                            }
                            if ($rootScope.data.value === 'BG') {
                                $scope.EplacesBG = ldPlaces;
                                var filterBG = $filter('listELSearchFilter')($scope.EplacesBG, item.value);
                                $scope.EplacesBG = filterBG;
                            }
                        }
                    }
                    $timeout(function () {
                        admob.requestInterstitialAd();
                    }, 5000);
                }
            });
        }

        $scope.testclick = function () {
            
        }

        var initList = function () {
            $scope.lat = "";
            $scope.long = "";
            geoService.getCurrentPosition(posOptions).then(function (position) {
                $scope.lat = position.coords.latitude;
                $scope.long = position.coords.longitude;
                if ($scope.lat !== null && $scope.lat !== undefined && $scope.long !== null && $scope.long !== undefined) {
                    getPlaces();
                }
            }, function (error) {
                $ionicLoading.hide();
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: Get Current Position',
                    template: error.message
                });
            });
        }

        var getPlaces = function () {
            latLng = { latitude: $scope.lat, longitude: $scope.long }
            var pyrmont = new google.maps.LatLng($scope.lat, $scope.long);
            var request = {
                location: pyrmont,
                radius: '5000',
                types: ['gas_station']
            };

            if ($rootScope.data.value === 'BN') {
                var service = new google.maps.places.PlacesService(document.getElementById('main').appendChild(document.createElement('div')));
                service.nearbySearch(request, function (results, status) {
                    angular.forEach(results, function (place, key) {
                        if (place.vicinity !== null && place.vicinity !== undefined) {
                            var str = place.vicinity;
                            var city = str.split(",");
                            if (city[1] !== null && city[1] !== undefined) {
                                place.city = city[1].trim();
                            }
                        }                      

                        setImageName(place.name, place);
                        promise1 = getPrices(place.place_id, place);
                        promise2 = calculateDistances(place, place.geometry);
                        $q.all(promise1, promise2).then(function () {

                            gPlace[key] = place;
                            $scope.places = gPlace;
                        });
                    });
                });
            }

            if ($rootScope.data.value === 'LD') {
                nobilCSService.getNearByCS($scope.lat, $scope.long).then(function (data) {
                    if (data.chargerstations !== undefined && data.chargerstations.length !== 0) {
                        angular.forEach(data.chargerstations, function (val, key) {
                            var pos = val.csmd.Position;
                            var opening24Hrs = "";
                            var maxPTime = "";
                            var pFee = "";
                            var csType = "";

                            if (val.attr.st[24].trans === 'Yes' || val.attr.st[24].trans === 'yes') {
                                opening24Hrs = 'Ja';
                            }
                            if (val.attr.st[24].trans === 'No' || val.attr.st[24].trans === 'no') {
                                opening24Hrs = 'Nei';
                            }
                            if (val.attr.st[6].trans === 'Yes' || val.attr.st[6].trans === 'yes') {
                                maxPTime = 'Ja';
                            }
                            if (val.attr.st[6].trans === 'No' || val.attr.st[6].trans === 'no') {
                                maxPTime = 'Nei';
                            }
                            if (val.attr.st[7].trans === 'Yes' || val.attr.st[7].trans === 'yes') {
                                pFee = 'Ja'
                            }
                            if (val.attr.st[7].trans === 'No' || val.attr.st[7].trans === 'no') {
                                pFee = 'Nei'
                            }

                            if (val.attr.conn[1][20] !== undefined && val.attr.conn[1][20] !== null) {
                                if (val.attr.conn[1][20].trans === 'Mode 1') {
                                    csType = 'Normal lading';
                                    ldType = 'Mode 1';
                                }
                                if (val.attr.conn[1][20].trans === 'Mode 2') {
                                    csType = 'Normal lading (adapter)';
                                    ldType = 'Mode 2';
                                }
                                if (val.attr.conn[1][20].trans === 'Mode 3') {
                                    csType = 'Hurtiglading';
                                    ldType = 'Mode 3';
                                }
                                if (val.attr.conn[1][20].trans === 'Mode 4') {
                                    csType = 'DC Hurtiglading (CHAdeMO)';
                                    ldType = 'Mode 4';
                                }
                            }


                            var csPlace = {
                                'csId': val.csmd.International_id,
                                'pos': val.csmd.Position,
                                'csImg': val.csmd.Image,
                                'csName': val.csmd.name,
                                'csOpen24hrs': opening24Hrs,
                                'csChargingCapasity': val.attr.conn[1][5].trans,
                                'csChargingPoints': val.csmd.Number_charging_points,
                                'csParkingFee': pFee,
                                'csPTimeLimit': maxPTime,
                                'csType': csType,
                                'ldType': ldType
                            }

                            var arr = pos.replace(/[^\d,.]/g, "").split(",");
                            $scope.cslat = arr[0];
                            $scope.cslong = arr[1];
                            var prom = calculateDistancesLD(csPlace, $scope.cslat, $scope.cslong);
                            prom.then(function (res) {
                                $timeout(function () {
                                    ldPlaces[key] = csPlace;
                                    $scope.Eplaces = ldPlaces;
                                }, 1500);
                            });
                        });
                    }
                });
            }

            if ($rootScope.data.value === 'BG') {
                $scope.places = [];
                $scope.Eplaces = [];
                getBNAndLD();
            }
        }

        var getBNAndLD = function () {
            latLng = { latitude: $scope.lat, longitude: $scope.long }
            var pyrmont = new google.maps.LatLng($scope.lat, $scope.long);
            var request = {
                location: pyrmont,
                radius: '5000',
                types: ['gas_station']
            };
            var service = new google.maps.places.PlacesService(document.getElementById('main').appendChild(document.createElement('div')));
            service.nearbySearch(request, function (results, status) {
                angular.forEach(results, function (place, key) {
                    setImageName(place.name, place);
                    promise1 = getPrices(place.place_id, place);
                    promise2 = calculateDistances(place, place.geometry);
                    $q.all(promise1, promise2).then(function () {
                        gPlace[key] = place;
                        $scope.placesBG = gPlace;
                    });
                });
            });

            nobilCSService.getNearByCS($scope.lat, $scope.long).then(function (data) {
                if (data.chargerstations !== undefined && data.chargerstations.length !== 0) {
                    angular.forEach(data.chargerstations, function (val, key) {
                        var pos = val.csmd.Position;

                        var opening24Hrs = "";
                        var maxPTime = "";
                        var pFee = "";
                        var csType = "";
                        var ldType = "";

                        if (val.attr.st[24].trans === 'Yes' || val.attr.st[24].trans === 'yes') {
                            opening24Hrs = 'Ja';
                        }
                        if (val.attr.st[24].trans === 'No' || val.attr.st[24].trans === 'no') {
                            opening24Hrs = 'Nei';
                        }
                        if (val.attr.st[6].trans === 'Yes' || val.attr.st[6].trans === 'yes') {
                            maxPTime = 'Ja';
                        }
                        if (val.attr.st[6].trans === 'No' || val.attr.st[6].trans === 'no') {
                            maxPTime = 'Nei';
                        }
                        if (val.attr.st[7].trans === 'Yes' || val.attr.st[7].trans === 'yes') {
                            pFee = 'Ja'
                        }
                        if (val.attr.st[7].trans === 'No' || val.attr.st[7].trans === 'no') {
                            pFee = 'Nei'
                        }
                        if (val.attr.conn[1][20] !== undefined && val.attr.conn[1][20] !== null) {
                            if (val.attr.conn[1][20].trans === 'Mode 1') {
                                csType = 'Normal lading';
                                ldType = 'Mode 1';
                            }
                            if (val.attr.conn[1][20].trans === 'Mode 2') {
                                csType = 'Normal lading (adapter)';
                                ldType = 'Mode 2';
                            }
                            if (val.attr.conn[1][20].trans === 'Mode 3') {
                                csType = 'Hurtiglading';
                                ldType = 'Mode 3';
                            }
                            if (val.attr.conn[1][20].trans === 'Mode 4') {
                                csType = 'DC Hurtiglading (CHAdeMO)';
                                ldType = 'Mode 4';
                            }
                        }


                        var csPlace = {
                            'csId': val.csmd.International_id,
                            'pos': val.csmd.Position,
                            'csImg': val.csmd.Image,
                            'csName': val.csmd.name,
                            'csOpen24hrs': opening24Hrs,
                            'csChargingCapasity': val.attr.conn[1][5].trans,
                            'csChargingPoints': val.csmd.Number_charging_points,
                            'csParkingFee': pFee,
                            'csPTimeLimit': maxPTime,
                            'csType': csType,
                            'ldType': ldType
                        }

                        var arr = pos.replace(/[^\d,.]/g, "").split(",");
                        $scope.cslat = arr[0];
                        $scope.cslong = arr[1];
                        var prom = calculateDistancesLD(csPlace, $scope.cslat, $scope.cslong);
                        prom.then(function (res) {
                            $timeout(function () {
                                ldPlaces[key] = csPlace;
                                $scope.EplacesBG = ldPlaces;
                            }, 1500);
                        });
                    });
                }
            });
        }

        var getPrices = function (placeid, place) {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                backAndService.getPrices(placeid).then(function (response) {
                    setPrices(response.data, place);
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Insert failed:' + error.status,
                        template: error.statusText
                    });
                });
                deferred.resolve(place);
                return deferred.promise;
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
        }

        var setPrices = function (res, place) {
            angular.forEach(res, function (value, key) {
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
        }

        var calculateDistances = function (place, geometry) {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                var mylatLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);
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
                deferred.resolve(place, geometry);
                return deferred.promise;
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
        }

        var calculateDistancesLD = function (csPlace, lat, long) {
            return $q(function (resolve, reject) {
                var mylatLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);
                var service = new google.maps.DistanceMatrixService();
                var destLatLng = new plugin.google.maps.LatLng(lat, long);
                csPlace.distance = "";
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
                        csPlace.distance = dist;
                    }
                }
                resolve(csPlace);
            }, function (sender, args) {
                reject(args.get_message());
            });
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

            if (Circle == "Circle" || smCircle == "circle") {
                place.mimg = "";
                place.mimg = "../img/" + Circle + ".png";
            }
            else if (best == "Best") {
                place.mimg = "";
                place.mimg = "../img/" + best + ".png";
            }
            else if (YX == "YX") {
                place.mimg = "";
                place.mimg = "../img/" + YX + ".png";
            }
            else if (Esso !== null || Deli != null) {
                if (Esso == "Esso") {
                    place.mimg = "../img/" + Esso + ".png";
                }
                if (Deli == "Deli") {
                    place.mimg = "../img/deli.png";
                }
            }
            else if (essosm == "esso") {
                place.mimg = "../img/" + essosm + "sm.png";
            }
            else if (Shell == "Shell" || ShellL == "SHELL") {
                place.mimg = "";
                place.mimg = "../img/Shell.png";
            }
            else if (St1 == "St1") {
                place.mimg = "";
                place.mimg = "../img/" + St1 + ".png";
            }
            else if (s123 == "3") {
                place.mimg = "";
                place.mimg = "../img/entotre.png";
            }
            else if (UnoX == "Uno-X") {
                place.mimg = "";
                place.mimg = "../img/" + UnoX + ".png";
            }
            else if (eco1 == "Eco-1" || eco1 == "eco-1" || eco1 == "eco1" || eco1 == "eco- 1") {
                place.mimg = "";
                place.mimg = "../img/" + eco1 + ".png";
            }
            else if (tanken == "Tanken" || tanke == "Tanke") {
                place.mimg = "";
                place.mimg = "www/img/tanken.png";
            }
            else if (bunker == "Bunker Oil") {
                place.mimg = "";
                place.mimg = "www/img/bunker.png";
            }
            else {
                place.mimg = "";
                place.mimg = "../img/Fuel.png";
            }
        }

        var getAllSettings = function (db) {
            if (window.sqlitePlugin !== undefined) {
                db.transaction(function (tx) {
                    db.executeSql("SELECT id,title,value FROM settings",
                        [],
                        function (res) {
                            for (var i = 0; i < res.rows.length; i++) {
                                var item = res.rows.item(i);
                                if (item.title === 'drivType') {
                                    $rootScope.data = { id: item.id, title: item.title, value: item.value }
                                }
                            }
                        });
                });
            }
        }

        $rootScope.$ionicGoBack = function () {
            //$state.go('app.main');
            $ionicHistory.goBack();
        };

        $timeout(function () {
            $scope.isExpanded = false;
            $scope.$parent.setExpanded(false);
        }, 300);

        // Set Motion
        ionicMaterialMotion.fadeSlideInRight();

        // Set Ink
        ionicMaterialInk.displayEffect();
    }
})();

