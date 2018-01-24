"use strict";
(function () {
    angular.module('driv.gastStationDetailsCtrl', ['jkuri.touchspin'])
        .controller('gastStationDetailsCtrl', gastStationDetailsCtrl);

    gastStationDetailsCtrl.$inject = ['$scope', '$q', 'ngGPlacesAPI', '$state', '$rootScope', '$ionicHistory', '$stateParams', '$timeout', '$ionicLoading', 'ionicMaterialMotion', 'ionicMaterialInk', '$cordovaSQLite', '$ionicPlatform', '$ionicPopup', 'geoService', 'ngAzureService', '$ionicModal', 'Backand', '$http', 'backAndService', 'googleAdMobService'];
    function gastStationDetailsCtrl($scope, $q, ngGPlacesAPI, $state, $rootScope, $ionicHistory, $stateParams, $timeout, $ionicLoading, ionicMaterialMotion, ionicMaterialInk, $cordovaSQLite, $ionicPlatform, $ionicPopup, geoService, ngAzureService, $ionicModal, Backand, $http, backAndService, googleAdMobService) {
        var pid;
        var plc;
        var distance;
        var stateName = $ionicHistory.backView().stateName;
        var B95Id = null;
        var B95 = "";
        var priceB95Id = '';
        var B98Id = null;
        var DId = null;
        var bly95 = null;
        var db = null;
        var favExsist = false;

        var posOptions = {
            frequency: 1000,
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $scope.showGasIconB95 = false;
        $scope.showUserIconB95 = false;
        $scope.showGasIconB98 = false;
        $scope.showUserIconB98 = false;
        $scope.showGasIconD = false;
        $scope.showUserIconD = false;

        $scope.$state = $state;
        $scope.$stateParams = $stateParams;
        $scope.place = [];
        $scope.newBP = {};

        $scope.$on("$ionicView.enter", function () {
            initDetails();
        });

        $scope.test3D = function (csPosition) {
            var o = "(" + $scope.lat + "," + $scope.long + ")";
            $state.go('app.PanoramaMap', { pos: o });
        }

        $scope.$on("$ionicView.beforeLeave", function () {
            $ionicLoading.hide();
        });

        var initDetails = function () {
            var ref = $scope.$stateParams.ref;
            if (ref !== "") {
                ngGPlacesAPI.placeDetails({ reference: ref }).then(
                    function (place) {
                        $ionicLoading.show({
                            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                            content: 'Laster opp kart...',
                            showBackdrop: false
                        });

                        plc = place;
                        pid = place.place_id;
                        insertPlace(place);

                        var prom2 = calculateDistances(place, place.geometry);
                        $q.all(prom2).then(function () {
                            $timeout(function () {
                                $scope.place = place;
                                document.addEventListener("deviceready", openDb, false);
                                setImageName(place.name, place);
                                $scope.getDirections = function () {
                                    getGmapDirection(place);
                                }
                            }, 500);
                        }, function (error) {
                            $ionicPopup.alert({
                                title: 'Details',
                                template: error.message
                            });
                        });

                    }, function (error) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: error.message
                        });
                    });
            }
        }

        $scope.Blyfri95 = {
            inputValue: ngAzureService.defaultB95,
            minValue: -9007199254740991,
            maxValue: 9007199254740991,
            precision: 2,
            decimalStep: 0.01,
            format: "DECIMAL",
            titleLabel: 'Blyfri95',
            setLabel: 'Lagre',
            closeLabel: 'Lukk',
            setButtonType: 'button-positive',
            closeButtonType: 'button-stable',
            callback: function (val) {
                var str = plc.distance;
                if ($rootScope.isAuthorized === true) {
                    if (str !== null && str !== undefined) {
                        var d = str.split(" ");
                        var updtdBy = 'station';
                        if (d[1] === "km") {
                            var dist = parseFloat(d[0]);
                            if (dist <= 3.0) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B95Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                        if (d[1] === "m") {
                            var dist = parseInt(d[0]);
                            //dist = parseFloat(dist / 1000);
                            if (dist <= 500) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B95Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                    }
                }     
                else {
                    if (str !== null && str !== undefined) {
                        var d = str.split(" ");
                        var updtdBy = 'user';

                        if (d[1] === "km") {
                            var dist = parseFloat(d[0]);
                            if (dist <= 3.0) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B95Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.'
                                });
                            }
                        }
                        if (d[1] === "m") {
                            var dist = parseInt(d[0]); 
                            //dist = parseFloat(dist / 1000);
                            if (dist <= 500) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B95Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.'
                                });
                            }
                        }
                    }

                }
            }
        };

        $scope.Blyfri98 = {
            inputValue: ngAzureService.defaultB98,
            minValue: -9007199254740991,
            maxValue: 9007199254740991,
            precision: 2,
            decimalStep: 0.01,
            format: "DECIMAL",
            titleLabel: 'Blyfri98',
            setLabel: 'Lagre',
            closeLabel: 'Lukk',
            setButtonType: 'button-positive',
            closeButtonType: 'button-stable',
            callback: function (val) {
                var str = plc.distance;
                if ($rootScope.isAuthorized === true) {
                    if (str !== null && str !== undefined) {
                        var updtdBy = 'station';
                        var d = str.split(" ");
                        if (d[1] === "km") {
                            var dist = parseFloat(d[0]);
                            if (dist <= 1.0) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B98Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                        if (d[1] === "m") {
                            var dist = parseInt(d[0]);
                            //dist = parseFloat(dist / 1000);
                            if (dist <= 500) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B98Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                    }
                }
                else {
                    if (str !== null && str !== undefined) {
                        var d = str.split(" ");
                        var updtdBy = 'user';
                        if (d[1] === "km") {
                            var dist = parseFloat(d[0]);
                            if (dist <= 1.0) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B98Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                        if (d[1] === "m") {
                            var dist = parseInt(d[0]);
                            //dist = parseFloat(dist / 1000);
                            if (dist <= 500) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, B98Id, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                    }
                }
            }
        };

        $scope.Diesel = {
            inputValue: ngAzureService.defaultD,
            minValue: -9007199254740991,
            maxValue: 9007199254740991,
            precision: 2,
            decimalStep: 0.01,
            format: "DECIMAL",
            titleLabel: 'Diesel',
            setLabel: 'Lagre',
            closeLabel: 'Lukk',
            setButtonType: 'button-positive',
            closeButtonType: 'button-stable',
            callback: function (val) {
                var str = plc.distance;
                if ($rootScope.isAuthorized === true) {
                    if (str !== null && str !== undefined) {
                        var dist = str.split(" ");
                        var updtdBy = 'station';
                        if (d[1] === "km") {
                            var dist = parseFloat(d[0]);
                            if (dist <= 1.0) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, DId, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                        if (d[1] === "m") {
                            var dist = parseInt(d[0]);
                            //dist = parseFloat(dist / 1000);
                            if (dist <= 500) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, DId, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                    }

                }
                else {
                    if (str !== null && str !== undefined) {
                        var updtdBy = 'user';
                        var d = str.split(" ");
                        if (d[1] === "km") {
                            var dist = parseFloat(d[0]);
                            if (dist <= 1.0) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, DId, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                        if (d[1] === "m") {
                            var dist = parseInt(d[0]);
                            //dist = parseFloat(dist / 1000);
                            if (dist <= 500) {
                                var newPrice = val;
                                if (newPrice !== undefined) {
                                    updatePrice(newPrice, plc, DId, updtdBy);
                                    $timeout(function () {
                                        admob.requestInterstitialAd();
                                    }, 5000);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Info',
                                    template: 'Du befinner deg for langt unna bensinstasjonen.' +
                                    ' Registrering av priser forutsetter at du fysisk er til stedet på bensinstasjonen og observerer riktig pris.' + '\n' +
                                    'Klikk på refresh knappen oppe til høyre for å oppdatere riktig avstand slik at du kan få lagt inn riktig pris.'
                                });
                            }
                        }
                    }

                }
            }
        };

        $rootScope.$ionicGoBack = function () {
            // $state.go('app.list');
            $ionicHistory.goBack();
        };

        $scope.saveFav = function () {
            $ionicPlatform.ready(function () {
                saveFav();
            });
        }

        $scope.startCall = function (number) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });

            window.plugins.CallNumber.callNumber(onSuccess, onError, number);
            $ionicLoading.hide();
            var onSuccess = function () {
                // $ionicLoading.hide();
            }

            var onError = function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Feilet ved oppkobling',
                    template: error.message
                });
            }
        }

        $scope.refresh = function () {
            initDetails();
        }

        var getPos = function () {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                geoService.getCurrentPosition(posOptions).then(function (position) {
                    $rootScope.lat = position.coords.latitude;
                    $rootScope.long = position.coords.longitude;
                    deferred.resolve($scope.lat, $scope.long);
                });
                return deferred.promise;
            }, function (sender, args) {
                deferred.reject(args.get_message());
            });
        }

        var openDb = function () {
            if (window.sqlitePlugin !== undefined) {
                db = window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' });
                db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS GS_Favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, place_id TEXT,name TEXT,vicinity TEXT, reference TEXT, lat int, long int)", []);
                });
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM GS_Favorites', [],
                        function (tx, results) {
                            var len = results.rows.length;
                            var p = $scope.place;
                            for (var i = 0; i < len; ++i) {
                                var obj = results.rows.item(i);
                                if (results.rows.item(i).place_id === p.place_id) {
                                    favExsist = true;
                                    $scope.favStyle = { "color": 'yellow' }
                                    $scope.$apply();
                                }
                            }
                        },
                        function (tx, e) {
                            $ionicLoading.hide();
                        });
                });
            }
        }

        var saveFav = function () {
            var p = $scope.place;
            var lat = p.geometry.location.lat();
            var long = p.geometry.location.lng();

            if (favExsist === false) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                    content: 'Lagrer favoritt',
                    showBackdrop: false
                });
                db.transaction(function (tx) {
                    tx.executeSql('INSERT INTO GS_Favorites (place_id,name,vicinity,reference,lat,long) VALUES (?,?,?,?,?,?)',
                        [p.place_id, p.name, p.vicinity, p.reference, lat, long], function (res) {
                            favExsist = true;
                            $scope.favStyle = { "color": 'yellow' }
                            $scope.$apply();
                            $ionicLoading.hide();
                        }, function (error) {
                            $ionicLoading.hide();
                        })
                })
                $ionicLoading.hide();

            }
            if (favExsist === true) {
                db.transaction(function (tx) {
                    var mDate = new Date();
                    tx.executeSql("DELETE FROM GS_Favorites WHERE place_id = ?",
                        [p.place_id],
                        function (tx, r) {
                            favExsist = false;
                            $scope.favStyle = {}
                            $ionicLoading.hide();
                        },
                        function (tx, e) {
                            $ionicLoading.hide();
                            db.close();
                        })
                });
            }
        }

        var getGmapDirection = function (place) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });

            var originlatLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);

            var latMrk = place.geometry.location.lat();
            var longMrk = place.geometry.location.lng();
            var latLngDestination = new plugin.google.maps.LatLng(latMrk, longMrk);

            plugin.google.maps.Map.isAvailable(function (isAvailable, message) {
                if (isAvailable) {
                    $ionicLoading.hide();
                    plugin.google.maps.external.launchNavigation({
                        "from": originlatLng,
                        "to": latLngDestination
                    });
                }
            })
        }

        var insertPlace = function (place) {
            var query2 = 'GetGasStationsWhere';
            var pId = place.place_id;
            return $http({
                method: 'GET',
                url: Backand.getApiUrl() + '/1/query/data/' + query2,
                params: {
                    parameters: {
                        place_id: pId
                    }
                }
            }).then(function (response) {
                if (response.data.length === 0) {
                    insertGasStation(place);
                }
                else {
                    getPrices(pid);
                    $ionicLoading.hide();
                }
                //console.log(JSON.stringify(response.data[0]));
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Insert failed:' + error.status,
                    template: error.statusText
                });
                $ionicLoading.hide();
            });
        }

        var insertGasStation = function (place) {
            var placeid = place.place_id;
            var lat = place.geometry.location.lat();
            var long = place.geometry.location.lng();
            var date = new Date();
            var shortDate = date.toLocaleString();

            var data = {
                place_id: placeid,
                name: place.name,
                vicinity: place.vicinity,
                reference: place.reference,
                latitude: lat,
                longitude: long
            }

            backAndService.insertGasStation(data).then(function (response) {
                var gId = response.data.__metadata.id;
                var prom = addDefaultPrices(placeid, gId);
                prom.then(function () {
                    $timeout(function () {
                        getPrices(placeid);
                        $ionicLoading.hide();
                    }, 700);
                });

            }, function (error) {
                $ionicPopup.alert({
                    title: 'Insert failed:' + error.status,
                    template: error.statusText
                });
                $ionicLoading.hide();
            });
        }

        var addDefaultPrices = function (placeid, gId) {
            return $q(function (resolve, reject) {
                var date = new Date();
                var shortDate = date.toLocaleString();
                var allprices = [
                    {
                        place_id: placeid,
                        type: "Blyfri95",
                        updateDate: shortDate,
                        price: "14.00",
                        gsId: gId
                    },
                    {
                        place_id: placeid,
                        type: "Blyfri98",
                        updateDate: shortDate,
                        price: "16.00",
                        gsId: gId
                    },
                    {
                        place_id: placeid,
                        type: "Diesel",
                        updateDate: shortDate,
                        price: "13.00",
                        gsId: gId
                    }
                ]
                var resp = [];
                for (var i = 0; i < allprices.length; i++) {
                    var data = allprices[i];
                    backAndService.addDefPrices(data).then(function (response) {
                        resp.push(response.data[0])
                    }, function (error) {
                        ;
                        $ionicPopup.alert({
                            title: 'DefaultPrices Error: ' + error.status,
                            template: error.statusText
                        });
                        $ionicLoading.hide();
                    });
                }
                resolve(resp);
            }, function (sender, args) {
                reject(args.get_message());
            })
        }

        var getPrices = function (placeId) {
            backAndService.getPrices(placeId).then(function (response) {
                setPrices(response.data);
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Insert failed:' + error.status,
                    template: error.statusText
                });
                $ionicLoading.hide();
            });
        }

        var setPrices = function (resp) {
            angular.forEach(resp, function (value, key) {
                if (value.type === "Blyfri95") {
                    B95Id = value.id;
                    $rootScope.bly95 = value.price;
                    priceB95Id = value.id;
                    $scope.B95 = value.price;
                    B95 = value.price;
                    $scope.updateDateB95 = value.updateDate;
                    if (value.updatedBy === 'station') {
                        $scope.showGasIconB95 = true;
                        $scope.showUserIconB95 = false;
                    }
                    if (value.updatedBy === 'user') {
                        $scope.showGasIconB95 = false;
                        $scope.showUserIconB95 = true;
                    }
                }
                if (value.type === "Blyfri98") {
                    B98Id = value.id;
                    $scope.B98 = value.price;
                    $scope.updateDateB98 = value.updateDate;
                    if (value.updatedBy === 'station') {
                        $scope.showGasIconB98 = true;
                        $scope.showUserIconB98 = false;
                    }
                    if (value.updatedBy === 'user') {
                        $scope.showGasIconB98 = false;
                        $scope.showUserIconB98 = true;
                    }
                }
                if (value.type === "Diesel") {
                    DId = value.id;
                    $scope.Dsl = value.price;
                    $scope.updateDateDsl = value.updateDate;
                    if (value.updatedBy === 'station') {
                        $scope.showGasIconD = true;
                        $scope.showUserIconD = false;
                    }
                    if (value.updatedBy === 'user') {
                        $scope.showGasIconD = false;
                        $scope.showUserIconD = true;
                    }
                }
            });
        }

        var calculateDistances = function (place, geometry) {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                var mylatLng = new plugin.google.maps.LatLng($rootScope.lat, $rootScope.long);
                var service = new google.maps.DistanceMatrixService();
                var latitude = geometry.location.lat();
                var longitude = geometry.location.lng();
                var destLatLng = new plugin.google.maps.LatLng(latitude, longitude);
                place.distance = "";
                $scope.dist = "";

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
                        $scope.dist = dist;
                    }
                }
                deferred.resolve($scope.dist);
                return deferred.promise;
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
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
            var DeliL = str.match(/DELI/gi);
            var essosm = str.match(/esso/gi);
            var St1 = str.match(/St1/gi);
            var s123 = str.match(/1-2-3/gi);
            var UnoX = str.match(/Uno/gi);
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
                if (DeliL == "DELI") {
                    place.mimg = "../img/deli.png";
                }
            }
            else if (essosm == "esso") {
                place.mimg = "";
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
            else if (UnoX == "Uno") {
                place.mimg = "";
                place.mimg = "../img/Uno-X.png";
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

        var updatePrice = function (newPrice, place, id, updtdBy) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Oppdaterer...',
                showBackdrop: false
            });
            var date = new Date();
            var shortDateD = date.toLocaleString();
            var data = { price: newPrice, updateDate: shortDateD, updatedBy: updtdBy};
            backAndService.updatePrice(data, id).then(function (result) {
                getPrices(place.place_id);
                $ionicLoading.hide();
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Failed updating Price:' + error.status,
                    template: error.statusText
                });
                $ionicLoading.hide();
            })
        }

        ionicMaterialInk.displayEffect();
    }
})();
