(function () {
    angular.module('driv.MapCtrl', [])
            .controller('MapCtrl', MapCtrl);

    MapCtrl.$inject = ['$scope', '$state', '$q','$filter', '$ionicHistory', '$ionicPlatform', '$rootScope', 'uiGmapGoogleMapApi', 'ngGPlacesAPI', '$ionicLoading', '$ionicModal', '$location', 'ionicMaterialInk', '$ionicPopup', '$timeout', 'geoService', 'ngAzureService', '$cordovaGeolocation', 'backAndService', 'nobilCSService', 'googleAdMobService','ngDialog'];

    function MapCtrl($scope, $state, $q, $filter, $ionicHistory, $ionicPlatform, $rootScope, uiGmapGoogleMapApi, ngGPlacesAPI, $ionicLoading, $ionicModal, $location, ionicMaterialInk, $ionicPopup, $timeout, geoService, ngAzureService, $cordovaGeolocation, backAndService, nobilCSService, googleAdMobService, ngDialog) {
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        var map;
        var markersBN = [];
        var markersBNSrch = [];
        var markersLD = [];
        var markersBG = [];
        var clusterer;
        var latLng;
        var place = [];
        var alertPopup;
        var latLngMarker;
        var mrkr = null;
        var pDist;
        var posOptions = {
            frequency: 1000,
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        var prom1;
        var prom2;
        var prom3;
        var prom3;
        var prom5;

        var distArr = null;
        var distArrL = null;
        var priceArr = null;
        var mrkrImg;
        var markerInfoImg;
        var mrkrs = null;

        $scope.showInfoBtn = false;

        $scope.choiceB = false;
        $scope.choiceL = false;

        $scope.data = [];  

        $scope.$on("$ionicView.afterLeave", function () {
            //var opt = AdMob.AD_POSITION.BOTTOM_CENTER;
            //googleAdMobService.showBanner(opt);
        });

        $scope.$on("$ionicView.enter", function () {
            try {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                    content: 'Laster opp kart...',
                    showBackdrop: false
                });

                $scope.lat = "";
                $scope.long = "";
                geoService.getCurrentPosition(posOptions).then(function (position) {
                    if (position !== null && position !== undefined) {
                        $scope.lat = position.coords.latitude;
                        $scope.long = position.coords.longitude;
                        if ($scope.lat !== null && $scope.lat !== undefined && $scope.long !== null && $scope.long !== undefined) {
                       
                            prom1 = getBNPlaces();
                            prom2 = getLDPlaces();
                            prom3 = getBNAndLD();
                            prom4 = getAllSearchedBNPlaces();
                            prom5 = setData();

                            $q.all(prom1, prom2, prom3, prom4, prom5).then(function () {
                                $timeout(function () {
                                    if ($rootScope.data.value === 'BN') {
                                        $scope.showInfoBtn = false;
                                    }
                                    if ($rootScope.data.value === 'LD') {
                                        $scope.showInfoBtn = true;
                                    }
                                    if ($rootScope.data.value === 'BG') {
                                        $scope.showInfoBtn = true;
                                    }
                                    initMap();
                                    $ionicLoading.hide();
                                }, 1500);
                            });
                        }
                    }
                }, function (error) {
                    $ionicLoading.hide();
                    var errorPopup = $ionicPopup.alert({
                        title: 'Error: Get Current Position',
                        template: error.message
                    });
                })
            }
            catch (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error: Map',
                    template: error.message
                });
            }
        });

        $scope.$on("$ionicView.leave", function () {
            map.clear();
            map.off();
            map.trigger("MARKER_REMOVE");
            $rootScope.chosenPlace = "";
        });

        $scope.refresh = function () {
            $state.reload();
        }

        $scope.showInfo = function () {
            map.setClickable(false);
            ngDialog.open({
                template: 'templates/infoModal.html',
                className: 'ngdialog-theme-default',
                preCloseCallback: function (value) {
                    map.setClickable(true);
                }
            });
        }

        $scope.selectFilter = function () {
            map.setClickable(false);
            ngDialog.open({
                template: 'templates/selectFilterModal.html',
                controller: 'selectFilterModal',
                className: 'ngdialog-theme-default',
                preCloseCallback: function (item) {
                    if (item !== null && item !== undefined) {
                        map.trigger("category_change", item.value);
                        map.setClickable(true);
                    }
                }
            });
        }

        $scope.selectedFilter = function (item) {
            console.log(item);
        }

        var initMap = function () {
            var opt;
            var div = document.getElementById("map_canvas");
            if (mrkrs != null) {
                if (mrkrs.length > 0) {
                    opt = {
                        'camera': {
                            'target': mrkrs[0].position,
                            'zoom': 3
                        }
                    };
                }
            }
            map = plugin.google.maps.Map.getMap(div, opt);
            map.addEventListener(plugin.google.maps.event.MAP_READY, function () {

                if ($rootScope.chosenPlace !== undefined && $rootScope.chosenPlace !== "") {
                    latLng = new plugin.google.maps.LatLng($rootScope.srchdLat, $rootScope.srchdLong);
                }
                else {
                    latLng = new plugin.google.maps.LatLng($scope.lat, $scope.long);
                    map.setOptions({
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
                    map.addMarker({
                        'icon': 'www/img/stations/currentPos.png',
                        'position': latLng,
                        'draggable': true
                    }, function (drgmarker) {
                        drgmarker.addEventListener(plugin.google.maps.event.MARKER_DRAG_END, function (drgmarker) {
                            drgmarker.getPosition(function (latLngDestination) {
                                var fromDest = new plugin.google.maps.LatLng(latLng.lat, latLng.lng)
                                var direclatLng = new plugin.google.maps.LatLng(latLngDestination.lat, latLngDestination.lng);
                                map.setClickable(false);
                                var confirmPopup = $ionicPopup.confirm({
                                    title: 'Kjørehennvisning',
                                    template: 'Starte kjørehennvisning?',
                                    buttons: [{
                                        text: 'Avbryt',
                                        type: 'button-default',
                                        onTap: function (e) {
                                            map.setClickable(true);
                                            drgmarker.setPosition(latLng);
                                        }
                                    }, {
                                        text: 'Ok',
                                        type: 'button-positive',
                                        onTap: function (e) {
                                            var nav = {
                                                "from": fromDest,
                                                "to": direclatLng
                                            }
                                            plugin.google.maps.external.launchNavigation(nav);
                                            map.setClickable(true);
                                            drgmarker.setPosition(latLng);
                                        }
                                    }]
                                })
                            });
                        });
                    });
                }

                map.animateCamera({
                    'target': latLng,
                    'tilt': 0,
                    'zoom': 13,
                    'bearing': 140,
                    'duration': 3000 // = 5 sec.
                });
                addAllMarkers();
                //map.setWatchDogTimer(20000);
            });
            map.one(plugin.google.maps.event.MAP_READY, function () {

                // Catch all camera events
                //map.on(plugin.google.maps.event.CAMERA_MOVE_START, function () { });
                //map.on(plugin.google.maps.event.CAMERA_MOVE, function () { });
                //map.on(plugin.google.maps.event.CAMERA_MOVE_END, onCameraEvents);

            });
        }

        var currentPosMarker = function () {
            map.addMarker({
                'icon': 'www/img/stations/currentPos.png',
                'position': latLng,
                'draggable': true
            }, function (drgmarker) {
                drgmarker.addEventListener(plugin.google.maps.event.MARKER_DRAG_END, function (drgmarker) {
                    drgmarker.getPosition(function (latLngDestination) {
                        var fromDest = new plugin.google.maps.LatLng(latLng.lat, latLng.lng)
                        var direclatLng = new plugin.google.maps.LatLng(latLngDestination.lat, latLngDestination.lng);
                        map.setClickable(false);
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Kjørehennvisning',
                            template: 'Starte kjørehennvisning?',
                            buttons: [{
                                text: 'Lukk',
                                type: 'button-default',
                                onTap: function (e) {
                                    map.setClickable(true);
                                    drgmarker.setPosition(latLng);
                                }
                            }, {
                                text: 'Ok',
                                type: 'button-positive',
                                onTap: function (e) {
                                    var nav = {
                                        "from": fromDest,
                                        "to": direclatLng
                                    }
                                    plugin.google.maps.external.launchNavigation(nav);
                                    map.setClickable(true);
                                    drgmarker.setPosition(latLng);
                                }
                            }]
                        })
                    });
                });
            });
        }

        var setData = function () {
            if ($rootScope.chosenPlace !== undefined && $rootScope.chosenPlace !== "") {
                mrkrs = markersBNSrch;
            }
            else {
                if ($rootScope.data.value === 'BN') {
                    mrkrs = markersBN;
                }
                if ($rootScope.data.value === 'LD') {
                    mrkrs = markersLD;
                }
                if ($rootScope.data.value === 'BG') {
                    mrkrs = markersBG;
                }
            }
        }

        var addAllMarkers = function () {
            if (mrkrs !== null && mrkrs !== undefined) {
                var ldMarkers = $filter('filterMarkersLD')(mrkrs, "mType");
                var bnMarkers = $filter('filterMarkersBN')(mrkrs, "mType");

                addBNMarkers(bnMarkers);
                addLDMarkers(ldMarkers);
            }
        }

        var addBNMarkers = function (mrkrs) {
            map.addMarkerCluster({
                //debug: true,
                //maxZoomLevel: 5,
                markers: mrkrs,
                icons: [
                    { min: 2, max: 100, url: "./img/red.png", anchor: { x: 16, y: 16 } }
                ]
            }, function (markerCluster) {

                //-----------------------------------------------------------------------
                // Display the resolution (in order to understand the marker cluster)
                //-----------------------------------------------------------------------
                markerCluster.on("resolution_changed", function (prev, newResolution) {
                    var self = this;
                    label.innerHTML = "<b>zoom = " + self.get("zoom") + ", resolution = " + self.get("resolution") + "</b>";
                });
                markerCluster.trigger("resolution_changed");


                //------------------------------------
                // If you tap on a marker,
                // you can get the marker instnace.
                // Then you can do what ever you want.
                //------------------------------------
                var htmlInfoWnd = new plugin.google.maps.HtmlInfoWindow();
                markerCluster.on(plugin.google.maps.event.MARKER_CLICK, function (position, marker) {
                    console.log(marker.get("icon"));
                    var html = [
                        "<div style='width:250px;min-height:100px'>",
                        "<img src='img/stations/Stasjon.png' align='left'>",
                        "<strong>" + (marker.get("name")) + "</strong>"
                    ];
                    if (marker.get("vicinity")) {
                        html.push("<div style='font-size:0.8em;'>" + marker.get("vicinity") + "</div>");
                    }
                    //if (marker.get("phone")) {
                    //    html.push("<a href='tel:" + marker.get("phone") + "' style='font-size:0.8em;color:blue;'>Tel: " + marker.get("phone") + "</div>");
                    //}
                    html.push("</div>");
                    htmlInfoWnd.setContent(html.join(""));
                    htmlInfoWnd.open(marker);
                });
            });
        }

        var addLDMarkers = function (mrkrs) {
            map.addMarkerCluster({
                //debug: true,
                //maxZoomLevel: 5,
                markers: mrkrs,
                icons: [
                    { min: 2, max: 100, url: "./img/green.png", anchor: { x: 16, y: 16 } }
                ]
            }, function (markerCluster) {

                //-----------------------------------------------------------------------
                // Display the resolution (in order to understand the marker cluster)
                //-----------------------------------------------------------------------
                markerCluster.on("resolution_changed", function (prev, newResolution) {
                    var self = this;
                    label.innerHTML = "<b>zoom = " + self.get("zoom") + ", resolution = " + self.get("resolution") + "</b>";
                });
                markerCluster.trigger("resolution_changed");

                //------------------------------------
                // If you tap on a marker,
                // you can get the marker instnace.
                // Then you can do what ever you want.
                //------------------------------------
                var htmlInfoWnd = new plugin.google.maps.HtmlInfoWindow();
                markerCluster.on(plugin.google.maps.event.MARKER_CLICK, function (position, marker) {
                    var html = [
                        "<div style='width:250px;min-height:100px'>",
                        "<img src='" + marker.get("markerIcon") +"' style='height:50px;width:50px;' align='left'>",
                        "<strong>" + (marker.get("title") || marker.get("name")) + "</strong>"
                    ];
                    if (marker.get("address")) {
                        html.push("<div style='font-size:0.8em;'>" + marker.get("address") + "</div>");
                    }
                    if (marker.get("phone")) {
                        html.push("<a href='tel:" + marker.get("phone") + "' style='font-size:0.8em;color:blue;'>Tel: " + marker.get("phone") + "</div>");
                    }
                    html.push("</div>");
                    htmlInfoWnd.setContent(html.join(""));
                    htmlInfoWnd.open(marker);
                });
            });
        }

        var getBNPlaces = function () {
            return $q(function (resolve, reject) {
                var ngGPlacesRequest = {
                    radius: 4500,
                    latitude: $scope.lat,
                    longitude: $scope.long
                };
                geoService.getAllNearByPlaces(ngGPlacesRequest).then(function (data) {
                    if (data.length !== 0) {
                        for (var i = 0; i < data.length; i++) {
                            place = data[i];
                            mrkrData = {};
                            var latMrk = place.geometry.location.lat();
                            var longMrk = place.geometry.location.lng();
                            latLngMarker = new plugin.google.maps.LatLng(latMrk, longMrk);

                            var img = setImageName(place.name);
                            var markerInfoImg = setMarkerInfoImage(place.name); 
                            var pos = {
                                "lat": latLngMarker.lat,
                                "lng": latLngMarker.lng
                            }
                            var mrkrData = {
                                'position': pos,
                                'icon': img,
                                'mInfoIcon': markerInfoImg,
                                'vicinity': place.vicinity,
                                'disableAutoPan': false,
                                'animation': plugin.google.maps.Animation.BOUNCE,
                                'place_id': place.place_id,
                                'geoLat': place.geometry.location.lat(),
                                'geoLong': place.geometry.location.lng(),
                                'pRef': place.reference,
                                'mType': 'BN'
                            }
                            markersBN.push(mrkrData);
                        }
                    }
                    resolve(markersBN);
                });
            }, function (sender, args) {
                reject(args.get_message());
            });
        }

        var getLDPlaces = function () {
            return $q(function (resolve, reject) {
                nobilCSService.getNearByCS($scope.lat, $scope.long).then(function (data) {
                    if (data.chargerstations !== undefined && data.chargerstations.length !== null && data.chargerstations.length !== 0) {
                        angular.forEach(data.chargerstations, function (place, key) {
                            var pos = place.csmd.Position;
                            var arr = pos.replace(/[^\d,.]/g, "").split(",");
                            var latMrk = arr[0];
                            var longMrk = arr[1];
                            var chargingMode;
                            var cm = "";

                            latLngMarker = new plugin.google.maps.LatLng(latMrk, longMrk);

                            if (place.attr.st[24] !== null && place.attr.st[24] !== undefined) {
                                var c24t = "";
                                var csOpen24hrs = place.attr.st[24].trans;
                                if (csOpen24hrs === 'Yes') {
                                    c24t = 'Ja';
                                }
                                if (csOpen24hrs === 'No') {
                                    c24t = 'Nei';
                                }
                            }
                            if (place.attr.conn[1][20] !== null && place.attr.conn[1][20] !== undefined) {
                                chargingMode = place.attr.conn[1][20].trans;
                            }
                            var markerIcon = "";
                            var imgIcon = "";
                            if (place.attr.conn[1][20] !== undefined && place.attr.conn[1][20] !== null) {
                                if (chargingMode === 'Mode 1') {
                                    cm = 'Normal lading';
                                    markerIcon = 'Mode1.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                                if (chargingMode === 'Mode 2') {
                                    cm = 'Normal lading (adapter)';
                                    markerIcon = 'Mode2.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                                if (chargingMode === 'Mode 3') {
                                    cm = 'Hurtiglading';
                                    markerIcon = 'Mode3.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                                if (chargingMode === 'Mode 4') {
                                    cm = 'DC Hurtiglading (CHAdeMO)';
                                    markerIcon = 'Mode4.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                            }

                            var pos = {
                                "lat": latLngMarker.lat,
                                "lng": latLngMarker.lng
                            }
                            var mrkrData = {
                                'name': place.csmd.name,
                                'position': pos,
                                'icon': imgIcon,
                                'markerIcon': "http://www.nobil.no/img/ladestasjonbilder/" + place.csmd.Image,
                                'disableAutoPan': false,
                                'animation': plugin.google.maps.Animation.BOUNCE,
                                'geoLat': latMrk,
                                'geoLong': longMrk,
                                'Iid': place.csmd.International_id,
                                'mType': 'LD',
                                'csType': chargingMode
                            }
                            markersLD.push(mrkrData);
                        });
                    }
                    resolve(markersLD);
                });
            });
        }

        var getBNAndLD = function () {
            return $q(function (resolve, reject) {
                var ngGPlacesRequest = {
                    radius: 5000,
                    latitude: $scope.lat,
                    longitude: $scope.long
                };
                geoService.getAllNearByPlaces(ngGPlacesRequest).then(function (data) {
                    if (data.length !== 0) {
                        for (var i = 0; i < data.length; i++) {
                            place = data[i];
                            var latMrk = place.geometry.location.lat();
                            var longMrk = place.geometry.location.lng();
                            latLngMarker = new plugin.google.maps.LatLng(latMrk, longMrk);

                            var img = setImageName(place.name);
                            var markerInfoImg = setMarkerInfoImage(place.name); 

                            var pos = {
                                "lat": latLngMarker.lat,
                                "lng": latLngMarker.lng
                            }
                            var mrkrData = {
                                'position': pos,
                                'icon': img,
                                'mInfoIcon': markerInfoImg,
                                'vicinity': place.vicinity,
                                'disableAutoPan': false,
                                'animation': plugin.google.maps.Animation.BOUNCE,
                                'place_id': place.place_id,
                                'geoLat': place.geometry.location.lat(),
                                'geoLong': place.geometry.location.lng(),
                                'pRef': place.reference,
                                'mType': 'BN'
                            }
                            markersBG.push(mrkrData);
                        }
                    }
                });
                nobilCSService.getNearByCS($scope.lat, $scope.long).then(function (data) {
                    if (data.chargerstations !== undefined && data.chargerstations.length !== 0) {
                        angular.forEach(data.chargerstations, function (place, key) {
                            var pos = place.csmd.Position;
                            var arr = pos.replace(/[^\d,.]/g, "").split(",");
                            var latMrk = arr[0];
                            var longMrk = arr[1];
                            var cm = "";
                            var chargingMode;

                            latLngMarker = new plugin.google.maps.LatLng(latMrk, longMrk);

                            if (place.attr.st[24] !== null && place.attr.st[24] !== undefined) {
                                var c24t = "";
                                var csOpen24hrs = place.attr.st[24].trans;
                                if (csOpen24hrs === 'Yes') {
                                    c24t = 'Ja';
                                }
                                if (csOpen24hrs === 'No') {
                                    c24t = 'Nei';
                                }
                            }
                            if (place.attr.conn[1][20] !== null && place.attr.conn[1][20] !== undefined) {
                                var chargingMode = place.attr.conn[1][20].trans;
                            }

                            if (place.attr.conn[1][20] !== null && place.attr.conn[1][20] !== undefined) {
                                chargingMode = place.attr.conn[1][20].trans;
                            } 


                            var markerIcon = "";
                            var imgIcon = "";
                            if (place.attr.conn[1][20] !== undefined && place.attr.conn[1][20] !== null) {
                                if (chargingMode === 'Mode 1') {
                                    cm = 'Normal lading';
                                    markerIcon = 'Mode1.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                                if (chargingMode === 'Mode 2') {
                                    cm = 'Normal lading (adapter)';
                                    markerIcon = 'Mode2.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                                if (chargingMode === 'Mode 3') {
                                    cm = 'Hurtiglading';
                                    markerIcon = 'Mode3.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                                if (chargingMode === 'Mode 4') {
                                    cm = 'DC Hurtiglading (CHAdeMO)';
                                    markerIcon = 'Mode4.png';
                                    imgIcon = 'www/img/stations/' + markerIcon;
                                }
                            }

                            var pos = {
                                "lat": latLngMarker.lat,
                                "lng": latLngMarker.lng
                            }

                            var mrkrData = {
                                'name': place.csmd.name,
                                'position': pos,
                                'icon': imgIcon,
                                'markerIcon': "http://www.nobil.no/img/ladestasjonbilder/" + place.csmd.Image,
                                'disableAutoPan': false,
                                'animation': plugin.google.maps.Animation.BOUNCE,
                                'geoLat': latMrk,
                                'geoLong': longMrk,
                                'Iid': place.csmd.International_id,
                                'mType': 'LD',
                                'csType': chargingMode
                            }
                            markersBG.push(mrkrData);
                        });
                    }
                });
                resolve(markersBG);

            }, function (sender, args) {
                reject(args.get_message());
            })
        }

        var getAllSearchedBNPlaces = function () {
            return $q(function (resolve, reject) {
                if ($rootScope.chosenPlace !== undefined) {
                 for (var i = 0; i < $rootScope.chosenPlace.length; i++) {
                    var place = $rootScope.chosenPlace[i];
                    var latMrk = place.geometry.location.lat();
                    var longMrk = place.geometry.location.lng();
                    var latLngMarker = new plugin.google.maps.LatLng(latMrk, longMrk);
                    var img = setImageName(place.name);
                    var mrkrData = {
                        'position': latLngMarker,
                        'icon': img,
                        'title': place.name,
                        'vicinity': place.vicinity,
                        'disableAutoPan': false,
                        'animation': plugin.google.maps.Animation.BOUNCE,
                        'place_id': place.place_id,
                        'geoLat': place.geometry.location.lat(),
                        'geoLong': place.geometry.location.lng(),
                        'pRef': place.reference,
                        'mType': 'BN'
                    }
                    markersBNSrch.push(mrkrData);
                }
               }
                resolve(markersBNSrch);
            }, function (sender, args) {
                reject(args.get_message());
            });
        }

        function setImageName(name) {
            var str = name;
            var Circle = str.match(/Circle/gi);
            var Statoil = str.match(/Statoil/gi);
            var smCircle = str.match(/circle/gi);

            var Shell = str.match(/Shell/gi);
            var Esso = str.match(/Esso/gi);
            var DeliL = str.match(/DELI/gi);
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

            if (Statoil == "Statoil") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + Circle + ".png";
            }
            if (Circle == "Circle" || smCircle == "circle") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + Circle + ".png";
            }
            else if (best == "Best") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + best + ".png";
            }
            else if (YX == "YX") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + YX + ".png";
            }
            else if (Esso == "Esso" ||  DeliL == "DELI") {
                mrkrImg = "www/img/stations/" + Esso + ".png";
            }
            else if (essosm == "esso") {
                mrkrImg = "www/img/stations/" + essosm + ".png";
            }
            else if (Shell == "Shell") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + Shell + ".png";
            }
            else if (St1 == "St1") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + St1 + ".png";
            }
            else if (s123 == "3") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/s123.png";
            }
            else if (tanken == "Tanken" || tanke == "Tanke") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/Tanken.png";
            }
            else if (UnoX == "Uno-X") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + UnoX + ".png";
            }
            else if (bunker == "Bunker Oil") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/BunkerOil.png";
            }
            else if (eco1 == "Eco-1" || eco1 == "eco-1" || eco1 == "eco1") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/" + eco1 + ".png";
            }
            else if (eco11 == "Eco- 1" || eco11 == "eco- 1" || eco11 == "eco 1" || eco11 == "eco") {
                mrkrImg = "";
                mrkrImg = "www/img/stations/eco1.png";
            }
            else {
                mrkrImg = "";
                mrkrImg = "www/img/stations/Stasjon.png";
            }
            return mrkrImg;
        }

        function setMarkerInfoImage(name) {
            var str = name;
            var Circle = str.match(/Circle/gi);
            var Statoil = str.match(/Statoil/gi);
            var smCircle = str.match(/circle/gi);

            var Shell = str.match(/Shell/gi);
            var Esso = str.match(/Esso/gi);
            var DeliL = str.match(/DELI/gi);
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

            if (Statoil == "Statoil") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + Circle + ".png";
            }
            if (Circle == "Circle" || smCircle == "circle") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + Circle + ".png";
            }
            else if (best == "Best") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + best + ".png";
            }
            else if (YX == "YX") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + YX + ".png";
            }
            else if (Esso == "Esso" || DeliL == "DELI") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + Esso + ".png";
            }
            else if (essosm == "esso")
            {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + essosm + ".png";
            }
            else if (Shell == "Shell") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + Shell + ".png";
            }
            else if (St1 == "St1") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + St1 + ".png";
            }
            else if (s123 == "3") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/s123.png";
            }
            else if (tanken == "Tanken" || tanke == "Tanke") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/Tanken.png";
            }
            else if (UnoX == "Uno-X") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + UnoX + ".png";
            }
            else if (bunker == "Bunker Oil") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/BunkerOil.png";
            }
            else if (eco1 == "Eco-1" || eco1 == "eco-1" || eco1 == "eco1") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/" + eco1 + ".png";
            }
            else if (eco11 == "Eco- 1" || eco11 == "eco- 1" || eco11 == "eco 1" || eco11 == "eco") {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/eco1.png";
            }
            else {
                markerInfoImg = "";
                markerInfoImg = "/img/stations/Stasjon.png";
            }
            return markerInfoImg;
        }

        function onCameraEvents(cameraPosition) {
            var map = this;
            console.log(cameraPosition);
            $scope.lat = cameraPosition.target.lat;
            $scope.long = cameraPosition.target.lng;

            if ($rootScope.data.value === 'BN') {
                var prom1 = getBNPlaces();
                prom1.then(function () {
                    addAllMarkers();
                });
            }
            if ($rootScope.data.value === 'LD') {
                prom2 = getLDPlaces();
                prom2.then(function () {
                    addAllMarkers();
                });
            }
            if ($rootScope.data.value === 'BG') {
                prom3 = getBNAndLD();
                prom3.then(function () {
                    addAllMarkers();
                });
            }
        }

        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = false;
            $scope.$parent.setExpanded(false);
        }, 300);

        $rootScope.$ionicGoBack = function () {
            map.trigger("MARKER_REMOVE");
            $ionicHistory.goBack();
            //$state.go('app.main');
        };
    }
})();