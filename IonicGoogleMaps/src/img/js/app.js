angular.module('driv', [
    'ionic',
    'ionic-material',
    'ionMdInput',
    'ngCordova',
    'ngGPlaces',
    'uiGmapgoogle-maps',
    'ionic-numberpicker',
    'backand',
    'ngCookies',
    'ngSanitize',
    'ngDialog',
    'LocalStorageModule',
    'pascalprecht.translate',
    'driv.AppCtrl',
    'driv.MainCtrl',
    'driv.MapCtrl',
    'driv.ListCtrl',
    'driv.ModalCtrl',
    'driv.gastStationDetailsCtrl',
    'driv.searchCtrl',
    'driv.settingsController',
    'driv.searchDirective',
    'driv.favCtrl',
    'driv.SearchMapCtrl',
    'driv.elPlaceDetailsCtrl',
    'driv.LoginCtrl',
    'driv.geolocationService',
    'driv.httpInterceptor',
    'driv.loginService',
    'driv.backandAuthService',
    'driv.backAndService',
    'driv.googleAdMobService',
    'driv.nobilCSService',
    'driv.PanoramaMapCtrl',
    'driv.listSearchFilter',
    'driv.listELSearchFilter',
    'driv.selectFilterModal',
    'driv.mapFilter',
    'driv.filterMarkersBN',
    'driv.filterMarkersLD'
    //'driv.regPushService'
])

    .run(function ($ionicPlatform, $cordovaGeolocation, $rootScope, $timeout, $interval, $translate, googleAdMobService) {
        // Create the Azure client register for notifications.
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            if (typeof navigator.globalization !== "undefined") {
                navigator.globalization.getPreferredLanguage(function (language) {
                    $translate.use((language.value).split("-")[0]).then(function (data) {
                        $rootScope.lang = data;
                        //console.log("SUCCESS -> " + data);
                    }, function (error) {
                        //console.log("ERROR -> " + error);
                    });
                }, null);
            }

            $rootScope.deviceUUID = device.uuid;
        });
    })


    .config(function (ngGPlacesAPIProvider, ngGPlacesDefaults, BackandProvider, $httpProvider) {
        BackandProvider.setAppName('drivstoffpriser');
        BackandProvider.setSignUpToken('fe27375c-c301-4490-a801-5056e81453e5');
        BackandProvider.setAnonymousToken('fa28116d-838c-49ed-81dd-f7af3647d41e');

        ngGPlacesAPIProvider.setDefaults(ngGPlacesDefaults);
        //$httpProvider.interceptors.push('httpInterceptor');
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.views.maxCache(10);
        $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.tabs.position('top');

        $stateProvider.state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
        })
            .state('app.main', {
                url: '/main',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/main.html',
                        controller: 'MainCtrl'
                    }
                }
            })
            .state('app.map', {
                url: '/map',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/map.html',
                        controller: 'MapCtrl'
                    }
                }
            })
            .state('app.searchMap', {
                url: '/searchMap/:lat',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/searchMap.html',
                        controller: 'SearchMapCtrl'
                        //params: { lat: null ,long: null},
                    }
                }
            })
            .state('app.list', {
                url: '/list',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/liste.html',
                        controller: 'ListCtrl'
                    }
                }
            })
            .state('app.gastStationDetails', {
                url: '/gastStationDetails/:ref',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/gastStationDetails.html',
                        controller: 'gastStationDetailsCtrl'
                    }
                }
            })
            .state('app.elPlaceDetails', {
                url: '/elPlaceDetails/:Iid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/elPlaceDetails.html',
                        controller: 'elPlaceDetailsCtrl'
                    }
                }
            })
            .state('app.PanoramaMap', {
                url: '/PanoramaMap',
                params: {
                    pos: null
                },
                views: {
                    'menuContent': {
                        templateUrl: 'templates/PanoramaMap.html',
                        controller: 'PanoramaMapCtrl'
                    }
                }
            })
            .state('app.searchplaces', {
                url: '/searchplaces',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/searchplaces.html',
                        controller: 'searchCtrl'
                    }
                }
            })
            .state('app.fav', {
                url: '/fav',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/favoritter.html',
                        controller: 'favCtrl'
                    }
                }
            })
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html',
                        controller: 'settingsController'
                    }
                }
            })
            .state('app.aboutApp', {
                url: '/aboutApp',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/aboutApp.html',
                        controller: 'favCtrl'
                    }
                }
            })
            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/main');

    })

    .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
        $translateProvider.translations('nb', {
            appName: "DrivStoffApp'n",
            mainMeny: "Hovedmeny",
            favorites: "Favoritter",
            fav: "Favoritt",
            drivingRoute: "Kjørehenvisning",
            desc: "Beskrivelse",
            place: "Sted",
            avilability: "Tilgjengelighet",
            chargingPoint: "Ladepunkt",
            open24hrs: "Åpen 24t",
            maxParking: "Maks P-Tid",
            parkingpayment: "P-Avgift",
            access: "Tilgang",
            contact: "Kontakt",
            chargingtype: "Ladetype",
            chargingspeed: "Ladefart",
            vehicle: "Kjøretøy",
            se3dpics: "Se 3D Bilder",
            settings: "Instillinger",
            about: "Om App'n",
            map: "Kart",
            nearby: "I nærheten",
            search: "Søk"
        });
        $translateProvider.translations('sv', {
            hello_message: "Hola",
            goodbye_message: "Adios"
        });
        $translateProvider.translations('fi', {
            hello_message: "Hola",
            goodbye_message: "Adios"
        });
        $translateProvider.translations('en', {
            hello_message: "Hola",
            goodbye_message: "Adios"
        });

        $translateProvider.preferredLanguage("nb");
        $translateProvider.fallbackLanguage("en");

        // Enable escaping of HTML
        //$translateProvider.useSanitizeValueStrategy('sanitizeParameters');
        $translateProvider.useSanitizeValueStrategy(null);
    })

    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('DrivStoffAppn');
    })

    .constant('ngAzureService', {
        usernameBackAnd: "gonadn@gmail.com",
        passwordBackAnd: "Adn2011!",
        serviceURL: "http://dspmobileapp.azurewebsites.net",
        serviceKey: "dc35e786-bd35-4049-98bb-3807cae3a8bc",
        GS: "GasStations",
        PRCS: "Prices",
        defaultB95: "14.00",
        defaultB98: "16.00",
        defaultD: "13.00"
    })

    .constant('ngGPlacesDefaults', {
        types: ['gas_station'],
        nearbySearchKeys: ['place_id', 'name', 'vicinity', 'geometry', 'reference', 'photos'],
        placeDetailsKeys: ['place_id', 'name', 'vicinity', 'formatted_address', 'formatted_phone_number',
            'reference', 'geometry', 'email', 'photos', 'opening_hours', 'icon']
    })

    .run(function ($rootScope, $state, backandAuthService, Backand) {

        function unauthorized() {
            console.log("user is unauthorized, sending to login");
            $state.go('app.main');
        }

        function signout() {
            // LoginService.signout();
        }

        $rootScope.$on('unauthorized', function () {
            unauthorized();
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            if (toState.name === 'app.main') {
                signout();
            }
            else if (toState.name !== 'app.main' && Backand.getToken() === undefined) {
                unauthorized();
            }
        });

    })
