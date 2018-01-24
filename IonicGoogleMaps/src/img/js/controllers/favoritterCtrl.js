(function () {
    angular.module('driv.favCtrl', [])
        .controller('favCtrl', favCtrl);

    favCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$q', 'ionicMaterialMotion', 'ionicMaterialInk', '$ionicPlatform', '$ionicListDelegate', '$ionicLoading', '$cordovaGeolocation', 'ngAzureService', 'backAndService', 'googleAdMobService','nobilCSService']

    function favCtrl($scope, $rootScope, $timeout, $q, ionicMaterialMotion, ionicMaterialInk, $ionicPlatform, $ionicListDelegate, $ionicLoading, $cordovaGeolocation, ngAzureService, backAndService, googleAdMobService, nobilCSService) {
    

        $scope.$parent.showHeader();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);

        $scope.shouldShowDelete = false;
        $scope.listCanSwipe = true;
        $scope.choiceB = false;
        $scope.choiceL = false;
        $scope.choiceBG = false;

        var fav = [];
        var cfav = [];
        var mylatLng;
        var destLatLng;
        var promise1;
        var promise2;
        var posOptions = {
                 frequency: 1000,
                 enableHighAccuracy: true,
                 timeout: 5000,
                 maximumAge: 0
             }

        $scope.$on("$ionicView.enter", function () {
            $scope.favorites = [];
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });
            initType();
        });

         $scope.$on("$ionicView.beforeLeave", function () {
           // googleAdMobService.removeBanner();
        });

        $rootScope.$ionicGoBack = function () {
           // $state.go('app.list');
           $ionicHistory.goBack();
        };

        var iniFav = function () {
             $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                 var lat = position.coords.latitude;
                 var long = position.coords.longitude;
                 mylatLng = new plugin.google.maps.LatLng(lat, long);

                 window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' }, function (db) {
                     getAllFavorites(db);
                     $ionicLoading.hide();
                 }, function (error) {
                     var errorPopup = $ionicPopup.alert({
                         title: 'Error: Favoritter',
                         template: error.message
                     });
                 })
             });

         };

        $scope.slett = function (index, place_id) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });

            window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' }, function (db) {
                deleteFav(db, index, place_id);
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Error: Deleting favorite',
                    template: error.message
                });
            })
        }

        $scope.slettL = function (index, csId) {
            window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' }, function (db) {
                deleteFavL(db, index, csId);
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Error: deleting',
                    template: error.message
                });
            });
        }

        var deleteFavL = function (db, index, csId) {
            db.executeSql('DELETE FROM CS_Favorites where csId=?', [csId], function (res) {
                cfav.splice(index, 1);
                $ionicListDelegate.closeOptionButtons();
                $ionicLoading.hide();
            }, function (error) {
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: Deleting favorite',
                    template: error.message
                });
            })
        }

        var calculateDistances = function (item) {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                var service = new google.maps.DistanceMatrixService();
                item.distance = "";

                service.getDistanceMatrix(
                {
                    origins: [mylatLng],
                    destinations: [destLatLng],
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidHighways: false,
                    avoidTolls: false
                }, callback);

                function callback(response, status) {
                    if (status == google.maps.DistanceMatrixStatus.OK) {
                        var dist = response.rows[0].elements[0].distance.text;
                        item.distance = dist;
                    }
                }
                deferred.resolve(item);
                return deferred.promise;
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
        }

        var getPrices = function (item) {
            var deferred = $q.defer();
            var res = "";
            return $q(function (resolve, reject) {
                backAndService.getPrices(item.place_id).then(function (response) {
                    angular.forEach(response.data, function (value, key) {
                        if (value.type === "Blyfri95") {
                            item.B95 = value.price;
                        }
                        if (value.type === "Blyfri98") {
                            item.B98 = value.price;
                        }
                        if (value.type === "Diesel") {
                            item.D = value.price;
                        }
                    });
                    deferred.resolve(item);
                });
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
            return deferred.promise;
        }

        var getAllFavorites = function (db) {
            fav = [];
            cfav = [];
            db.executeSql('SELECT * FROM GS_Favorites', [], function (res) {
                for (var i = 0; i < res.rows.length; i++) {
                    var item = res.rows.item(i);
                    var latitude = item.lat;
                    var longitude = item.long;

                    destLatLng = new plugin.google.maps.LatLng(latitude, longitude);
                    setImageName(item.name, item);
                    promise1 = calculateDistances(item);
                    promise2 = getPrices(item);
                    fav.push(item);
                }
                var prom3 = getChargingFav(db);
                $q.all(promise1, promise2, prom3).then(function () {
                    $timeout(function () {
                        if ($rootScope.data.value === 'BN') {
                            $scope.favorites = fav;
                        }
                        if ($rootScope.data.value === 'LD') {
                            $scope.cfav = cfav;
                        }
                        if ($rootScope.data.value === 'BG') {
                            $scope.favorites = fav;
                            $scope.cfav = cfav;
                        }
                        $ionicLoading.hide();
                    }, 1000)
                });
            });
        }

        var getChargingFav = function (db) {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                db.executeSql('SELECT * FROM CS_Favorites', [], function (res) {
                    for (var i = 0; i < res.rows.length; i++) {
                        var item = res.rows.item(i);
                        Iid = null;
                        Iid = item.csId;
                        nobilCSService.getChargingPointDetails(Iid).then(function (data) {
                            if (data.chargerstations !== undefined && data.chargerstations.length !== 0) {
                                var csImg = "";
                                var opening24Hrs = "";
                                var maxPTime = "";
                                var pFee = "";
                                var csType = "";

                                var img = data.chargerstations[0].csmd.Image;
                                var pos = data.chargerstations[0].csmd.Position;

                                if (img === 'Kommer' || img === 'no.image.svg' || img === 'no.image.swg' || img === '' || img === null || img === undefined) {
                                    csImg = 'data:image/png;base64,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';
                                }
                                if (img !== 'Kommer' && img !== 'no.image.svg' && img !== 'no.image.swg' && img !== '' && img !== null && img !== undefined) {
                                    csImg = 'http://www.nobil.no/img/ladestasjonbilder/' + img;
                                }


                                if (data.chargerstations[0].attr.st[24].trans === 'Yes' || data.chargerstations[0].attr.st[24].trans === 'yes') {
                                    opening24Hrs = 'Ja';
                                }
                                if (data.chargerstations[0].attr.st[24].trans === 'No' || data.chargerstations[0].attr.st[24].trans === 'no') {
                                    opening24Hrs = 'Nei';
                                }
                                if (data.chargerstations[0].attr.st[6].trans === 'Yes' || data.chargerstations[0].attr.st[6].trans === 'yes') {
                                    maxPTime = 'Ja';
                                }
                                if (data.chargerstations[0].attr.st[6].trans === 'No' || data.chargerstations[0].attr.st[6].trans === 'no') {
                                    maxPTime = 'Nei';
                                }
                                if (data.chargerstations[0].attr.st[7].trans === 'Yes' || data.chargerstations[0].attr.st[7].trans === 'yes') {
                                    pFee = 'Ja'
                                }
                                if (data.chargerstations[0].attr.st[7].trans === 'No' || data.chargerstations[0].attr.st[7].trans === 'no') {
                                    pFee = 'Nei'
                                }
                                if (data.chargerstations[0].attr.conn[1][20].trans === 'Mode 1') {
                                    csType = 'Normal lading'
                                }
                                if (data.chargerstations[0].attr.conn[1][20].trans === 'Mode 2') {
                                    csType = 'Normal lading (adapter)'
                                }
                                if (data.chargerstations[0].attr.conn[1][20].trans === 'Mode 3') {
                                    csType = 'Hurtiglading'
                                }
                                if (data.chargerstations[0].attr.conn[1][20].trans === 'Mode 4') {
                                    csType = 'DC Hurtiglading (CHAdeMO)'
                                }

                                var csPlace = {
                                    'csId': data.chargerstations[0].csmd.International_id,
                                    'pos': data.chargerstations[0].csmd.Position,
                                    'csImg': csImg,
                                    'csName': data.chargerstations[0].csmd.name,
                                    'csOpen24hrs': opening24Hrs,
                                    'csChargingCapasity': data.chargerstations[0].attr.conn[1][5].trans,
                                    'csChargingPoints': data.chargerstations[0].csmd.Number_charging_points,
                                    'csParkingFee': pFee,
                                    'csPTimeLimit': maxPTime,
                                    'csType': csType
                                }

                                var arr = pos.replace(/[^\d,.]/g, "").split(",");
                                $scope.cslat = arr[0];
                                $scope.cslong = arr[1];
                                var prom = calculateDistancesLD(csPlace, $scope.cslat, $scope.cslong);
                                prom.then(function (res) {
                                    $timeout(function () {
                                        cfav.push(csPlace);
                                        $scope.Eplaces = cfav;
                                    }, 1000);
                                });
                            }
                        });
                    }
                    deferred.resolve(cfav);
                    return deferred.promise;
                });
            }, function (sender, args) {
                deferred.reject(args.get_message());
            });         
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
            })
        }

        var initType = function () {
            if ($rootScope.data.value === 'BN') {
                $scope.choiceB = true;
                $scope.choiceL = false;
                $scope.choiceBG = false;
                iniFav();
                $timeout(function () {
                    $ionicLoading.hide();
                }, 700);
            }
            if ($rootScope.data.value === 'LD') {
                $scope.choiceB = false;
                $scope.choiceBG = false;
                $scope.choiceL = true;
                            iniFav();

                $timeout(function () {
                    $ionicLoading.hide();
                }, 700);
            }
            if ($rootScope.data.value === 'BG') {
                $scope.choiceB = false;
                $scope.choiceL = false;
                $scope.choiceBG = true;
                iniFav();
                $timeout(function () {
                    $ionicLoading.hide();
                }, 700);
            }
        }

        var deleteFav = function (db, index, place_id) {
            db.executeSql('DELETE FROM GS_Favorites where place_id=?', [place_id], function (res) {
                fav.splice(index, 1);
                $ionicListDelegate.closeOptionButtons();
                $ionicLoading.hide();
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Error: Deleting favorite',
                    template: error.message
                });
            })
        }

        function setImageName(name, item) {
            var str = name;
            var Circle = str.match(/Circle/g);
            var smCircle = str.match(/circle/g);

            var Shell = str.match(/Shell/g);
            var Esso = str.match(/Esso/g);
            var essosm = str.match(/esso/g);
            var St1 = str.match(/St1/g);
            var UnoX = str.match(/Uno-X/g);
            var YX = str.match(/YX/g);
            var best = str.match(/Best/g);
            var eco1 = str.match(/Eco-1/g);

            if (Circle == "Circle" || smCircle == "circle") {
                item.mimg = "";
                item.mimg = "../img/" + Circle + ".png";
            }
            else if (best == "Best") {
                item.mimg = "";
                item.mimg = "../img/" + best + ".png";
            }
            else if (YX == "YX") {
                item.mimg = "";
                item.mimg = "../img/" + YX + ".png";
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
                item.mimg = "../img/" + essosm + "sm.png";
            }
            else if (Shell == "Shell") {
                item.mimg = "";
                item.mimg = "../img/" + Shell + ".png";
            }
            else if (St1 == "St1") {
                item.mimg = "";
                item.mimg = "../img/" + St1 + ".png";
            }
            else if (St1 == "1-2-3") {
                item.mimg = "";
                item.mimg = "../img/" + St1 + ".png";
            }
            else if (UnoX == "Uno-X") {
                item.mimg = "";
                item.mimg = "../img/" + UnoX + ".png";
            }
            else if (eco1 == "Eco-1") {
                item.mimg = "";
                item.mimg = "../img/" + eco1[0] + ".png";
            }
            else {
                item.mimg = "";
                item.mimg = "../img/Fuel.png";
            }
        }


        // Set Motion
        $timeout(function () {
            ionicMaterialMotion.slideUp({
                selector: '.slide-up'
            });
        }, 300);

        $timeout(function () {
            $scope.isExpanded = false;
            $scope.$parent.setExpanded(false);
            ionicMaterialMotion.fadeSlideInRight({
                startVelocity: 3000
            });
        }, 700);

        // Set Ink
        ionicMaterialInk.displayEffect();
    }
})();