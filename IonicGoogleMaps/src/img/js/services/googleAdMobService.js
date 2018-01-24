(function () {
    angular.module('driv.googleAdMobService', [])
                .factory('googleAdMobService', googleAdMobService);

    googleAdMobService.$inject = ['$q', '$window','$rootScope'];

    function googleAdMobService($q, $window, $rootScope) {

        var setDeviceAdMob = function () {
            var d = $q.defer();
            var admobid = {};
            $rootScope.adMobId = {};

            // select the right Ad Id according to platform
            if (/(android)/i.test(navigator.userAgent)) {
                admobid = { // for Android
                    banner: 'ca-app-pub-7507342497268278/7897609749',
                    interstitial: 'ca-app-pub-7507342497268278/1851076149'
                };
                $rootScope.adMobId = admobid;
                d.resolve($rootScope.adMobId, admobid);
            } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
                admobid = { // for iOS
                    banner: 'ca-app-pub-7507342497268278/6740353743',
                    interstitial: 'ca-app-pub-6869992474017983/7563979554'
                };
                $rootScope.adMobId = admobid;
                d.resolve($rootScope.adMobId, admobid);
            } else {
                //admobid = { // for Windows Phone
                //    banner: 'ca-app-pub-7507342497268278/6740353743',
                //    interstitial: 'ca-app-pub-6869992474017983/1355127956'
                //};
                //d.resolve(admobid);
                d.reject();
            }
            return d.promise;
        }

        var setOptions = function (options) {
            var d = $q.defer();
            $window.AdMob.setOptions(options, function () {
                d.resolve();
            }, function () {
                d.reject();
            });
            return d.promise;
        }

        var createBanner = function (options) {
            var d = $q.defer();

            $window.AdMob.createBanner(options, function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        var removeBanner = function () {
            var d = $q.defer();

            $window.AdMob.removeBanner(function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        var showBanner = function (position) {
            var d = $q.defer();

            $window.AdMob.showBanner(position, function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        var showBannerAtXY = function (x, y) {
            var d = $q.defer();

            $window.AdMob.showBannerAtXY(x, y, function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        var hideBanner = function () {
            var d = $q.defer();

            $window.AdMob.hideBanner(function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        var prepareInterstitial = function (options) {
            var d = $q.defer();

            $window.AdMob.prepareInterstitial(options, function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        var showInterstitial = function () {
            var d = $q.defer();

            $window.AdMob.showInterstitial(function () {
                d.resolve();
            }, function () {
                d.reject();
            });

            return d.promise;
        }

        return {
            setDeviceAdMob: setDeviceAdMob,
            setOptions: setOptions,
            createBanner: createBanner,
            removeBanner: removeBanner,
            showBanner: showBanner,
            showBannerAtXY: showBannerAtXY,
            hideBanner: hideBanner,
            prepareInterstitial: prepareInterstitial,
            showInterstitial: showInterstitial
        };
    };
})();