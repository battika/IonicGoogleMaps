(function () {
    angular.module('driv.MainCtrl', [])
        .controller('MainCtrl', MainCtrl);

    MainCtrl.$inject = ['$scope', '$rootScope', '$location', '$state', '$q', '$stateParams', '$timeout', '$ionicHistory', 'ionicMaterialMotion', 'ionicMaterialInk', '$cordovaSQLite', '$ionicPlatform', '$ionicPopup', '$ionicLoading', '$cordovaNetwork', '$ionicListDelegate', 'ngAzureService', '$cordovaGeolocation', 'geoService', 'backandAuthService', 'backAndService', 'nobilCSService', 'googleAdMobService'];

    function MainCtrl($scope, $rootScope, $location, $state, $q, $stateParams, $timeout, $ionicHistory, ionicMaterialMotion, ionicMaterialInk, $cordovaSQLite, $ionicPlatform, $ionicPopup, $ionicLoading, $cordovaNetwork, $ionicListDelegate, ngAzureService, $cordovaGeolocation, geoService, backandAuthService, backAndService, nobilCSService, googleAdMobService) {
        var fav = [];
        var cfav = [];
        var mylatLng;
        var destLatLng;
        var GCM_SENDER_ID = '5df55142cdee33a00194052ffe074f3bb116a36a';
        var mobileServiceClient;
        var pushNotification;
        var promise1;
        var promise2;
        var ldPlaces = {};
        var finishcreateSettingsTable = false;
        var posOptions = {
            frequency: 1000,
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        $scope.isAuthorized = false;
        $scope.showSearchBtn = false;
        $scope.choiceB = false;
        $scope.choiceL = false;
        $scope.choiceBG = false;
        $scope.Eplaces = [];
        $scope.cfav = "";
        $scope.$parent.showHeader();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);
        $scope.shouldShowDelete = false;
        $scope.listCanSwipe = true;
        $rootScope.lat = "";
        $rootScope.long = "";

        $scope.$on("$ionicView.enter", function () {
            $ionicPlatform.ready(function () {
                try {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                        content: 'Laster opp kart...',
                        showBackdrop: false
                    });

                    $scope.lat = "";
                    $scope.long = "";
                    $scope.favorites = [];

                    geoService.getCurrentPosition(posOptions).then(function (position) {
                        if (position !== null && position !== undefined) {
                            if ($scope.lat !== null && $scope.lat !== undefined && $scope.long !== null && $scope.long !== undefined) {
                                $scope.lat = position.coords.latitude;
                                $scope.long = position.coords.longitude;
                                $rootScope.lat = position.coords.latitude;
                                $rootScope.long = position.coords.longitude;
                                mylatLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);

                                window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' }, function (db) {
                                    var prom1 = createSettingsTable(db);
                                    var prom2 = getAllSettings(db);
                                    var prom3 = initAdsMob();
                                   // var prom4 = calldialog();



                                    $q.all(prom1, prom2, prom3).then(function () {
                                        $timeout(function () {
                                            createFavTable(db);
                                            getAllFavorites(db);
                                            $ionicLoading.hide();
                                        }, 1500);
                                    })
                                }, function (error) {
                                    $ionicLoading.hide();
                                    var errorPopup = $ionicPopup.alert({
                                        title: 'Error sqlitePlugin',
                                        template: error.message
                                    });
                                });
                            }
                        }
                        //else {
                        //    return;
                        //}
                    }, function (error) {
                        $ionicLoading.hide();
                        var errorPopup = $ionicPopup.alert({
                            title: 'Error: Get Current Position',
                            template: error.message
                        });
                    });
                }
                catch (err) {
                    var errorPopup = $ionicPopup.alert({
                        title: 'Error: Main',
                        template: error.message
                    });
                }
            });
        });

        var calldialog = function () {
            document.addEventListener("deviceready", function () {
                cordova.dialogGPS("GPS er deaktivert, app'n krever at GPS på din mobil er aktivert.",//message
                    "Use GPS, with wifi or 3G.",//description
                    function (buttonIndex) {//callback
                        switch (buttonIndex) {
                            case 0: break;//cancel
                            case 1: break;//neutro option
                            case 2: break;//user go to configuration
                        }
                    },
                    "Aktivere GPS?",//title
                    ["Avbryt", "Senere", "Slå på"]);//buttons
            });
        }

        $scope.$on("$ionicView.leave", function () {
            //$ionicHistory.clearCache();
            //$ionicHistory.clearHistory();
            $scope.cfav = []
            cFav = [];
        });

        $scope.test = function () {
            var nobilApiKey = '501abed701f4b59dc45364900bd6a53a';
            jQuery.ajax({
                type: 'POST',
                url: 'http://nobil.no/api/server/search.php',
                data: {
                    'apikey': nobilApiKey,
                    'apiversion': '3',
                    'action': "search",
                    'type': 'stats_TotalsAllCounties',
                    'countrycode': 'no'
                },
                success: printJsonObj,
                dataType: 'json'
            })

            function printJsonObj(data) {
                console.log(JSON.stringify(data));
            }
        }

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
                    title: 'Error: deleting',
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

        $scope.goToDetailsPage = function (p) {
            var id = p.csId;
            //$location.path('/elPlaceDetails/' + id);
            $state.go('app.elPlaceDetails', { 'Iid': id });
        }

        $scope.refresh = function () {
            $state.reload();

            $timeout(function () {
                admob.requestInterstitialAd();
            }, 5000);
        }

        var initType = function () {
            if ($rootScope.data !== null && $rootScope.data !== undefined) {
                if ($rootScope.data.value === 'BN') {
                    $scope.choiceB = true;
                    $scope.choiceL = false;
                    $scope.choiceBG = false;
                    $scope.showSearchBtn = true;
                    //initList();
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 700);
                }
                if ($rootScope.data.value === 'LD') {
                    $scope.choiceB = false;
                    $scope.choiceBG = false;
                    $scope.choiceL = true;
                    $scope.showSearchBtn = false;
                    // initList();
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 700);
                }
                if ($rootScope.data.value === 'BG') {
                    $scope.choiceB = false;
                    $scope.choiceL = false;
                    $scope.choiceBG = true;
                    $scope.showSearchBtn = true;
                    //initList();
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 700);
                }
            }
        }

        var createFavTable = function (db) {
            if (window.sqlitePlugin !== undefined) {
                db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS GS_Favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, place_id TEXT,name TEXT,vicinity TEXT, reference TEXT, lat int, long int)", []);
                });
                db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS CS_Favorites (id INTEGER PRIMARY KEY ASC, csId TEXT, pos TEXT)", []);
                });
            }
        }

        var getAllFavorites = function (db) {
            fav = [];
            cfav = [];
            var count = window.sessionStorage.getItem('hasRun');
            if (count) {
                window.sessionStorage.setItem('hasRun', count);
                //console.log("second time app launch");
            } else {
                window.sessionStorage.setItem('hasRun', 1);
            }

            if (count === null || count === undefined) {
                $state.reload();
            }
            else {
                db.executeSql('SELECT * FROM GS_Favorites', [], function (res) {
                    if (res.rows.length !== null && res.rows.length !== undefined) {
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
                    }

                    promise3 = getChargingFav(db);

                    $q.all(promise1, promise2, promise3).then(function () {
                        $timeout(function () {
                            if ($rootScope.data !== null && $rootScope.data !== undefined) {
                                if ($rootScope.data.value === 'BN') {
                                    $scope.$apply(function () {
                                        $scope.favorites = fav;
                                    });
                                }
                                if ($rootScope.data.value === 'LD') {
                                    $scope.$apply(function () {
                                        $scope.cfav = cfav;
                                    });
                                }
                                if ($rootScope.data.value === 'BG') {
                                    $scope.$apply(function () {
                                        $scope.favorites = fav;
                                        $scope.cfav = cfav;
                                    });
                                }
                            }

                            $ionicLoading.hide();
                        }, 1000)
                    });
                }, function (error) {
                    console.log(error);
                });
            }
        }

        var getChargingFav = function (db) {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                db.executeSql('SELECT * FROM CS_Favorites', [], function (res) {
                    if (res.rows.length !== null && res.rows.length !== undefined) {
                        for (var i = 0; i < res.rows.length; i++) {
                            var item = res.rows.item(i);
                            Iid = null;
                            Iid = item.csId;
                            nobilCSService.getChargingPointDetails(Iid).then(function (data) {
                                if (data.chargerstations !== undefined && data.chargerstations !== null && data.chargerstations.length !== 0) {
                                    var csImg = "";
                                    var opening24Hrs = "";
                                    var maxPTime = "";
                                    var pFee = "";
                                    var csType = "";
                                    var pos = data.chargerstations[0].csmd.Position;
                                    var img = data.chargerstations[0].csmd.Image;
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
                    }
                    else {
                        cfav = [];
                    }
                });
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
        }

        var deleteFav = function (db, index, place_id) {
            db.executeSql('DELETE FROM GS_Favorites where place_id=?', [place_id], function (res) {
                fav.splice(index, 1);
                $ionicListDelegate.closeOptionButtons();
                $ionicLoading.hide();
            }, function (error) {
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: Deleting favorite',
                    template: error.message
                });
            })
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
                service.getDistanceMatrix(
                    {
                        origins: [mylatLng],
                        destinations: [destLatLng],
                        travelMode: google.maps.TravelMode.DRIVING
                    }, callback);

                function callback(response, status) {
                    if (status === google.maps.DistanceMatrixStatus.OK) {
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
                    return deferred.promise;
                });
            }, function (sender, args) {
                deferred.reject(args.get_message());
            })
        }

        var createSettingsTable = function (db) {
            return $q(function (resolve, reject) {
                if (window.sqlitePlugin !== undefined) {
                    db.executeSql("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY ASC, title TEXT, value TEXT)",
                        [],
                        function (tx, r) {
                            db.transaction(function (tx) {
                                db.executeSql("Select id,title,value from settings",
                                    [],
                                    function (res) {
                                        if (res.rows.length === 0) {
                                            insertSettings();
                                            finishcreateSettingsTable = true;
                                            $ionicLoading.hide();
                                        }
                                    },
                                    function (tx, e) {
                                        var errorPopup = $ionicPopup.alert({
                                            title: 'Error: Create Settings',
                                            template: error.message
                                        });
                                        $ionicLoading.hide();
                                    });
                            });
                        });
                    resolve(finishcreateSettingsTable);
                }
            }, function (sender, args) {
                reject(args.get_message());
            });
        }

        var insertSettings = function () {
            if (window.sqlitePlugin !== undefined) {
                console.log($rootScope.lang);
                var settObj = [{ 'title': 'drivType', 'value': 'BN' },
                { 'title': 'drivCountry', 'value': $rootScope.lang }];

                db = window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' });
                db.transaction(function (tx) {
                    var cDate = new Date();
                    angular.forEach(settObj, function (item, key) {
                        db.executeSql("INSERT INTO settings(title, value) VALUES (?,?)",
                            [item.title, item.value],
                            function (res) {
                                for (var i = 0; i < res.rows.length; i++) {
                                    var item = res.rows.item(i);
                                    if (item.title === 'drivType') {
                                        $rootScope.data = { title: item.title, value: item.value }
                                    }
                                    if (item.title === 'drivCountry') {
                                        $rootScope.country = {
                                            title: item.title, value: item.value
                                        }
                                    }
                                }
                            },
                            function (e) {
                                console.log(e);
                            });
                    });
                });
            }
        }

        var getAllSettings = function (db) {
            return $q(function (resolve, reject) {
                if (window.sqlitePlugin !== undefined) {
                    db.transaction(function (tx) {
                        db.executeSql("SELECT id,title,value FROM settings",
                            [],
                            function (res) {
                                for (var i = 0; i < res.rows.length; i++) {
                                    var item = res.rows.item(i);
                                    if (item.title === 'drivType') {
                                        $rootScope.data = { title: item.title, value: item.value }
                                    }
                                    if (item.title === 'drivCountry') {
                                        $rootScope.country = {
                                            title: item.title, value: item.value
                                        }
                                    }
                                }
                                initType();
                            },
                            function (e) {
                                $ionicLoading.hide();
                            });
                    });
                    resolve($rootScope.data);
                }
            }, function (sender, args) {
                reject(args.get_message());
            });
        }

        var initAdsMob = function () {
            var deferred = $q.defer();
            return $q(function (resolve, reject) {
                if (admob) {
                    var admobid = {}
                    if (/(android)/i.test(navigator.userAgent)) {  // for android & amazon-fireos
                        admobid = {
                            banner: "ca-app-pub-7507342497268278/7897609749",
                            interstitial: "ca-app-pub-7507342497268278/1851076149",
                        }
                    } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {  // for ios
                        admobid = {
                            banner: "ca-app-pub-7507342497268278/7897609749",
                            interstitial: "ca-app-pub-7507342497268278/1851076149",
                        }
                    }

                    document.addEventListener('deviceready', function () {
                        admob.banner.config({
                            id: admobid.banner,
                            isTesting: true,
                            autoShow: true,
                        });
                        admob.banner.prepare();

                        admob.interstitial.config({
                            id: admobid.interstitial,
                            isTesting: true,
                            autoShow: false,
                        });
                        //admob.interstitial.prepare();
                        //$timeout(function () {
                        //    admob.interstitial.show();
                        //}, 30000);
                    }, false);

                    document.addEventListener('admob.banner.events.LOAD_FAIL', function (event) {
                        $ionicPopup.alert({
                            title: 'Error: Loading AdMob Banner',
                            template: event
                        });
                    });

                    
                    deferred.resolve(admobid);
                    return deferred.promise;
                    //registerAdEvents();
                } 

            }, function (sender, args) {
                deferred.reject(args.get_message());
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: AdMobAds plugin not ready',
                    template: args.get_message()
                });
            });
        }

        function clearData() {
            vm.data = null;
        }

        var setImageName = function (name, place) {
            var str = name;
            var Circle = str.match(/Circle/g);
            var smCircle = str.match(/circle/g);

            var Shell = str.match(/Shell/g);
            var Esso = str.match(/Esso/g);
            var Deli = str.match(/Deli/gi);
            var essosm = str.match(/esso/g);
            var St1 = str.match(/St1/g);
            var UnoX = str.match(/Uno-X/g);
            var YX = str.match(/YX/g);
            var best = str.match(/Best/g);
            var eco1 = str.match(/Eco-1/g);

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
            else if (Shell == "Shell") {
                place.mimg = "";
                place.mimg = "../img/" + Shell + ".png";
            }
            else if (St1 == "St1") {
                place.mimg = "";
                place.mimg = "../img/" + St1 + ".png";
            }
            else if (St1 == "1-2-3") {
                place.mimg = "";
                place.mimg = "../img/" + St1 + ".png";
            }
            else if (UnoX == "Uno-X") {
                place.mimg = "";
                place.mimg = "../img/" + UnoX + ".png";
            }
            else if (eco1 == "Eco-1") {
                place.mimg = "";
                place.mimg = "../img/" + eco1[0] + ".png";
            }
            else {
                place.mimg = "";
                place.mimg = "../img/Fuel.png";
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

    };
})();