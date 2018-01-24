(function () {
    angular.module('driv.elPlaceDetailsCtrl', [])
        .controller('elPlaceDetailsCtrl', elPlaceDetailsCtrl);

    elPlaceDetailsCtrl.$inject = ['$scope', '$rootScope', '$q', '$ionicModal', '$ionicHistory', '$state', '$location', '$ionicPopup', '$stateParams', 'nobilCSService', '$ionicLoading', '$ionicPlatform', 'geoService'];


    function elPlaceDetailsCtrl($scope, $rootScope, $q, $ionicModal, $ionicHistory, $state, $location, $ionicPopup, $stateParams, nobilCSService, $ionicLoading, $ionicPlatform, geoService) {
        var db = null;
        var favExsist = false;
        $scope.showSendBtn = true;
        $scope.showStopBtn = false;
        $rootScope.chargingStarted = false;
        $scope.sNr = { title: '' };
        $scope.founImg = false;
        $scope.noImg = false;

        var posOptions = {
            frequency: 1000,
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $scope.$on("$ionicView.enter", function () {
            try {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                    content: 'Lagrer favoritt',
                    showBackdrop: false
                });
                $scope.$state = $state;
                $scope.$stateParams = $stateParams;
                $rootScope.sNrTitle = "";

                var Iid = $scope.$stateParams.Iid;

                if ($rootScope.chargingStarted === true) {
                    $scope.showSendBtn = false;
                    $scope.showStopBtn = true;
                }
                if ($rootScope.chargingStarted === false) {
                    $scope.showSendBtn = true;
                }

                $ionicModal.fromTemplateUrl('templates/sendSmSModel.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false,
                    focusFirstInput: true
                }).then(function (modal) {
                    $scope.modal = modal;
                });

                checkAndroidPermissions();

                document.addEventListener("deviceready", deviceready, false);

                nobilCSService.getChargingPointDetails(Iid).then(function (data) {
                    if (data.chargerstations !== undefined && data.chargerstations.length !== 0) {

                        var pos = data.chargerstations[0].csmd.Position;
                        var arr = pos.replace(/[^\d,.]/g, "").split(",");
                        var cslat = arr[0];
                        var cslong = arr[1];

                        $scope.csPosition = pos;
                        var img = data.chargerstations[0].csmd.Image;
                        if (img === 'Kommer' || img === 'no.image.svg' || img === 'no.image.swg' || img === '' || img === null || img === undefined) {
                            $scope.founImg = false;
                            $scope.noImg = true;
                            $scope.csImg = 'data:image/png;base64,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';
                        }
                        if (img !== 'Kommer' && img !== 'no.image.svg' && img !== 'no.image.swg' && img !== '' && img !== null && img !== undefined) {
                            $scope.founImg = true;
                            $scope.csImg = 'http://www.nobil.no/img/ladestasjonbilder/' + img;
                        }

                        $scope.csName = data.chargerstations[0].csmd.name;
                        $scope.csLocationDesc = data.chargerstations[0].csmd.Description_of_location;
                        $scope.csChargingPoints = data.chargerstations[0].csmd.Number_charging_points;
                        $scope.csStreet = data.chargerstations[0].csmd.Street;
                        $scope.csHouseNr = data.chargerstations[0].csmd.House_number;
                        $scope.csMunci = data.chargerstations[0].csmd.Municipality;

                        var chargingMode = data.chargerstations[0].attr.conn[1][20].trans;
                        var csAccess = data.chargerstations[0].attr.conn[1][1].trans;
                        var csAvailablebility = data.chargerstations[0].attr.st[2].trans;
                        var csLocation = data.chargerstations[0].attr.st[3].trans;
                        var csOpen24hrs = data.chargerstations[0].attr.st[24].trans;
                        var csParkingFee = data.chargerstations[0].attr.st[7].trans;
                        var csPTimeLimit = data.chargerstations[0].attr.st[6].trans;
                        var csOpeningTime = data.chargerstations[0].attr.st[24].attrval;

                        if (csAccess === 'Standard key') {
                            $scope.csAccess = 'Standard nøkkel';
                        }
                        if (csAccess === 'Cellular phone') {
                            $scope.csAccess = 'Mobil telefon';
                        }
                        if (csAccess === 'Open') {
                            $scope.csAccess = 'Åpen';
                        }
                        if (csAccess === 'Payment') {
                            $scope.csAccess = 'Betaling';
                        }
                        if (csAvailablebility === 'Visitors') {
                            $scope.csAvailablebility = 'Besøkende';
                        }
                        if (csAvailablebility === 'By appointment') {
                            $scope.csAvailablebility = 'Boretslag';
                        }
                        if (csAvailablebility === 'Public') {
                            $scope.csAvailablebility = 'Offentlig';
                        }
                        if (csLocation === 'Shopping center') {
                            $scope.csLocation = 'Kjøpesenter';
                        }
                        if (csLocation === 'Transport hub') {
                            $scope.csLocation = 'Sports senter'
                        }
                        if (csLocation === 'Hotel &amp; restaurants') {
                            $scope.csLocation = 'Hotel';
                        }
                        if (csLocation === 'Gas station') {
                            $scope.csLocation = 'Bensinstasjon';
                        }
                        if (csLocation === 'Street') {
                            $scope.csLocation = 'Gate';
                        }
                        if (csLocation === 'Car park') {
                            $scope.csLocation = 'Parkeringshus';
                        }
                        if (csOpen24hrs === 'Yes') {
                            $scope.csOpen24hrs = 'Ja';
                        }
                        if (csOpen24hrs === 'No') {
                            $scope.csOpen24hrs = 'Nei';
                        }
                        if (csOpeningTime !== "1" && csOpeningTime !== "") {
                            $scope.csOpeningTime = csOpeningTime;
                        }
                        else {
                            $scope.csOpeningTime = "ingen";
                        }

                        if (csParkingFee === 'Yes') {
                            $scope.csParkingFee = 'Ja';
                        }
                        if (csParkingFee === 'No') {
                            $scope.csParkingFee = 'ingen';
                        }
                        if (csPTimeLimit === 'Yes') {
                            $scope.csPTimeLimit = 'Ja';
                        }
                        if (csPTimeLimit === 'No') {
                            $scope.csPTimeLimit = 'Nei';
                        }

                        if (data.chargerstations[0].attr.conn[1][20] !== undefined && data.chargerstations[0].attr.conn[1][20] !== null) {
                            if (chargingMode === 'Mode 1') {
                                $scope.chargingMode = 'Normal lading'
                            }
                            if (chargingMode === 'Mode 2') {
                                $scope.chargingMode = 'Mode 2'
                            }
                            if (chargingMode === 'Mode 3') {
                                $scope.chargingMode = 'Hurtiglading'
                            }
                            if (chargingMode === 'Mode 4') {
                                $scope.chargingMode = 'DC Hurtiglading (CHAdeMO)'
                            }
                        }


                        $scope.csConnector = data.chargerstations[0].attr.conn[1][4].trans;
                        $scope.csChargingCapasity = data.chargerstations[0].attr.conn[1][5].trans;
                        var vehicletype = data.chargerstations[0].attr.conn[1][17].trans;
                        if (vehicletype === 'All vehicles') {
                            $scope.csVehicleType = "Alle typer";
                        }

                        var prom = calculateDistancesLD(cslat, cslong);

                        $ionicLoading.hide();
                    }
                });


                $scope.callbackTimer = {};
                $scope.callbackTimer.status = 'Running';
                $scope.callbackTimer.callbackCount = 0;
                $scope.callbackTimer.finished = function () {
                    $scope.callbackTimer.status = 'COMPLETE!!';
                    $scope.callbackTimer.callbackCount++;
                    $scope.$apply();
                };

            }
            catch (exception) {
                $ionicLoading.hide();
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: ELDetails',
                    template: exception
                });
            }
        })

        $scope.$on("$ionicView.leave", function () {
            //$ionicHistory.clearCache();
            //$ionicHistory.clearHistory();
        });

        function checkPermissionCallbackSEND(status) {
            if (!status.hasPermission) {
                var errorCallback = function () {
                    //console.log('no sms permisions');
                    //ionic.Platform.exitApp();
                }
                permissions.requestPermission(permissions.SEND_SMS, function (status) {
                    if (!status.hasPermission) {
                        errorCallback();
                    }
                }, errorCallback);
            }
        }

        function checkPermissionCallbackREAD(status) {
            if (!status.hasPermission) {
                var errorCallback = function () {
                    ionic.Platform.exitApp();
                }

                permissions.requestPermission(function (status) {

                    if (!status.hasPermission) errorCallback();
                }, errorCallback, permissions.READ_SMS);
            }
        }

        $scope.test3D = function (csPosition) {
            var obj = { pos: csPosition }
            $state.go('app.PanoramaMap', { pos: csPosition });
        }

        $rootScope.$ionicGoBack = function () {
            // $state.go('app.list');
            $ionicHistory.goBack();
        };

        $scope.addFav = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });
            saveFav();
        }

        $scope.showSelectValue = function (selectedSmSNr) {
            $scope.sendSmSTo = selectedSmSNr;
            $rootScope.sendSmSTo = selectedSmSNr;
        }

        $scope.sendSmS = function () {
            if (SMS) {
                if ($scope.sNr.title !== '' && $scope.sNr.title !== null && $scope.sNr.title !== undefined) {
                    if ($scope.sendSmSTo === '2430') {
                        SMS.sendSMS($scope.sendSmSTo, "Start" + " " + $scope.sNr.title,
                            function (succ) {
                                startWatch();
                                onSMSArrive();
                                $rootScope.sNrTitle = $scope.sNr.title;
                                $scope.modal.hide();
                            },
                            function (error) {
                                alert('error');
                                stopWatch();
                            });
                    }
                    if ($scope.sendSmSTo === '59440063') {
                        SMS.sendSMS($scope.sendSmSTo, $scope.sNr.title,
                            function (succ) {
                                startWatch();
                                onSMSArrive();
                                $rootScope.sNrTitle = $scope.sNr.title;
                                $scope.modal.hide();
                            },
                            function (error) {
                                $ionicPopup.alert({
                                    title: 'Error: SmS StopWatch',
                                    template: error.message
                                });
                                stopWatch();
                            });
                    }

                }
                else {
                    $ionicPopup.alert({
                        title: 'SmS',
                        template: 'Lade nummer kan ikke være tom. Du finner riktig ladenummer ved ladeuttakene/ladekablene.'
                    });
                }
            }

            $timeout(function () {
                admob.requestInterstitialAd();
            }, 5000);
        }

        $scope.getDirections = function () {
            getGmapDirection($scope.csPosition);
        }

        $scope.sendAvsluttSmS = function () {
            if (SMS) {
                if ($scope.sNr.title !== '' && $scope.sNr.title !== null && $scope.sNr.title !== undefined) {
                    if ($rootScope.sendSmSTo === '2430') {
                        SMS.sendSMS($rootScope.sendSmSTo, "Avslutt" + " " + $scope.sNr.title,
                            function (succ) {
                                startWatch();
                                onSMSArrive();
                                $scope.modal.hide();
                            },
                            function (error) {
                                $ionicPopup.alert({
                                    title: 'Error: SmS',
                                    template: error.message
                                });
                                stopWatch();
                            });
                    }
                    if ($rootScope.sendSmSTo === '59440063') {
                        SMS.sendSMS($rootScope.sendSmSTo, $rootScope.sNrTitle,
                            function (succ) {
                                startWatch();
                                onSMSArrive();
                                $scope.modal.hide();
                            },
                            function (error) {
                                $ionicPopup.alert({
                                    title: 'Error: SmS',
                                    template: error.message
                                });
                                stopWatch();
                            });
                    }
                }
            }

            $timeout(function () {
                admob.requestInterstitialAd();
            }, 5000);
        }

        $scope.refresh = function () {
            $state.reload();
        }

        function addCDSeconds(sectionId, extraTime) {
            document.getElementById(sectionId).getElementsByTagName('timer')[0].addCDSeconds(extraTime);
        }

        function stopResumeTimer(sectionId, btn) {
            if (btn.innerHTML === 'Start') {
                document.getElementById(sectionId).getElementsByTagName('timer')[0].start();
                btn.innerHTML = 'Stop';
            }
            else if (btn.innerHTML === 'Stop') {
                document.getElementById(sectionId).getElementsByTagName('timer')[0].stop();
                btn.innerHTML = 'Resume';
            }
            else {
                document.getElementById(sectionId).getElementsByTagName('timer')[0].resume();
                btn.innerHTML = 'Stop';
            }
        }

        var startWatch = function () {
            if (SMS) SMS.startWatch(function () {
                //console.log('watching', 'watching started');
            }, function () {
                // console.log('failed to start watching');
            });
        }

        var stopWatch = function () {
            if (SMS) SMS.stopWatch(function () {
                //console.log('watching', 'watching stopped');
            }, function () {
                // console.log('failed to stop watching');
            });
        }

        var onSMSArrive = function () {
            document.addEventListener('onSMSArrive', function (e) {
                var sms = e.data;
                if (sms.address === '2430') {
                    var str = sms.body;
                    var startCharging = str.match(/Ladingen starter/g);
                    var stopCharging = str.match(/Ladingen er avsluttet/g);
                    var notFound = str.match(/Ladestolpen ble ikke funnet/g);
                    var noAnswer = str.match(/Ladestolpen svarte ikke/g);
                    var busyCharging = str.match(/Ladestolpen er dessverre opptatt/g);

                    if (startCharging !== null && startCharging !== undefined) {
                        if (startCharging[0] === 'Ladingen starter') {
                            $scope.showSendBtn = false;
                            $scope.showStopBtn = true;
                            $rootScope.chargingStarted = true;
                            $ionicPopup.alert({
                                title: 'SmS',
                                template: sms.body
                            });
                        }
                    }

                    if (stopCharging !== null && stopCharging !== undefined) {
                        if (stopCharging[0] === 'Ladingen er avsluttet') {
                            $scope.showSendBtn = true;
                            $scope.showStopBtn = false;
                            $rootScope.chargingStarted = false;
                            var totalCost = Number(sms.body.replace(/[^0-9\.]+/g, ""));
                            //saveChargingData(totalCost);
                            $ionicPopup.alert({
                                title: 'SmS',
                                template: sms.body
                            });
                            stopWatch();
                        }
                    }

                    if (notFound !== null) {
                        if (notFound[0] === 'Ladestolpen ble ikke funnet') {
                            $scope.showSendBtn = true;
                            $scope.showStopBtn = false;
                            $ionicPopup.alert({
                                title: 'SmS',
                                template: sms.body
                            });
                            stopWatch();
                        }
                    }

                    if (noAnswer !== null) {
                        if (noAnswer[0] !== 'Ladestolpen svarte ikke') {
                            $scope.showSendBtn = true;
                            $scope.showStopBtn = false;
                            $ionicPopup.alert({
                                title: 'SmS',
                                template: sms.body
                            });
                            stopWatch();
                        }
                    }

                    if (busyCharging !== null) {
                        if (busyCharging === 'Ladestolpen er dessverre opptatt') {
                            $scope.showSendBtn = true;
                            $scope.showStopBtn = false;
                            $ionicPopup.alert({
                                title: 'SmS',
                                template: sms.body
                            });
                            stopWatch();
                        }
                    }
                }
            });
        }

        var saveChargingData = function (totalCost) {
            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO ChargingData(csId, pos) VALUES (?,?)",
                    [$scope.$stateParams.Iid, $scope.csPosition],
                    function (tx, r) {
                        favExsist = true;
                        $scope.favStyle = { "color": 'yellow' }
                        $ionicLoading.hide();
                    },
                    function (tx, e) {
                        $ionicLoading.hide();
                        db.close();
                    });
            });
        }

        var getGmapDirection = function (pos) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                content: 'Laster opp kart...',
                showBackdrop: false
            });

            var arr = pos.replace(/[^\d,.]/g, "").split(",");
            $scope.cslat = arr[0];
            $scope.cslong = arr[1];

            var originlatLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);

            var latMrk = $scope.cslat;
            var longMrk = $scope.cslong;
            var latLngDestination = new plugin.google.maps.LatLng(latMrk, longMrk);

            plugin.google.maps.Map.isAvailable(function (isAvailable, message) {
                if (isAvailable) {
                    $ionicLoading.hide();
                    plugin.google.maps.external.launchNavigation({
                        "from": originlatLng,
                        "to": latLngDestination
                    });
                }
            }, function (err) {
                $ionicPopup.alert({
                    title: 'Error: Navigation',
                    template: err.message
                });
            });
        }

        var deviceready = function () {
            if (window.sqlitePlugin !== undefined) {
                db = window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' });
                db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS CS_Favorites (id INTEGER PRIMARY KEY ASC, csId TEXT, pos TEXT)", []);
                });
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM CS_Favorites', [],
                        function (tx, results) {
                            var len = results.rows.length;
                            if (len > 0 && len !== null) {
                                for (var i = 0; i < len; ++i) {
                                    var obj = results.rows.item(i);
                                    if (results.rows.item(i).csId === $scope.$stateParams.Iid) {
                                        favExsist = true;
                                        $scope.favStyle = { "color": 'yellow' }
                                        $scope.$apply();
                                    }
                                }
                            }

                        },
                        function (tx, e) {
                            $ionicLoading.hide();
                        });
                });
            }



            geoService.getCurrentPosition(posOptions).then(function (position) {
                $scope.lat = position.coords.latitude;
                $scope.long = position.coords.longitude;
            });
        }

        var saveFav = function () {
            if (favExsist === false) {
                db.transaction(function (tx) {
                    tx.executeSql("INSERT INTO CS_Favorites(csId, pos) VALUES (?,?)",
                        [$scope.$stateParams.Iid, $scope.csPosition],
                        function (tx, r) {
                            favExsist = true;
                            $scope.favStyle = { "color": 'yellow' }
                            $ionicLoading.hide();
                        },
                        function (tx, e) {
                            $ionicLoading.hide();
                        });
                });
            }
            if (favExsist === true) {
                db.transaction(function (tx) {
                    var mDate = new Date();
                    tx.executeSql("DELETE FROM CS_Favorites WHERE csId = ?",
                        [$scope.$stateParams.Iid],
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

        var calculateDistancesLD = function (lat, long) {
            return $q(function (resolve, reject) {
                var mylatLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);
                var service = new google.maps.DistanceMatrixService();
                var destLatLng = new plugin.google.maps.LatLng(lat, long);
                var dist = "";
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
                        $scope.$apply(function () {
                            $scope.dist = response.rows[0].elements[0].distance.text;
                        });
                        //$scope.csDistance = dist;
                    }
                }
                resolve($scope.dist);
            }, function (sender, args) {
                reject(args.get_message());
            });
        }

        var checkAndroidPermissions = function () {
            var permissions = window.cordova.plugins.permissions;
            permissions.hasPermission(permissions.SEND_SMS, checkPermissionCallbackSEND, null);
            permissions.requestPermission(permissions.SEND_SMS, checkPermissionCallbackSEND, null);
            permissions.requestPermissions(permissions.READ_SMS, checkPermissionCallbackSEND, null);
        }

        $scope.openModal = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });
    }

})();
