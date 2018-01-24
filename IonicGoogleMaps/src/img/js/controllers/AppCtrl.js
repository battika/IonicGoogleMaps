(function () {
    angular.module('driv.AppCtrl', [])
        .controller('AppCtrl', AppCtrl);

    AppCtrl.$inject = ['$scope', '$rootScope', '$ionicSideMenuDelegate', '$cordovaNetwork', '$ionicModal', '$ionicPopover', '$timeout', 'backandAuthService', 'ngAzureService', 'googleAdMobService', '$window'];


    function AppCtrl($scope, $rootScope, $ionicSideMenuDelegate, $cordovaNetwork, $ionicModal, $ionicPopover, $timeout, backandAuthService, ngAzureService, googleAdMobService, $window) {
        $scope.isExpanded = false;
        $scope.hasHeaderFabLeft = false;
        $scope.hasHeaderFabRight = false;

        $scope.isMenuOpen = $ionicSideMenuDelegate.isOpen.bind($ionicSideMenuDelegate);

        ////////////////////////////////////////
        // AdMob
        ////////////////////////////////////////
        document.addEventListener("deviceready", onDeviceReady, false);

        function onDeviceReady() {
            document.removeEventListener('deviceready', onDeviceReady, false);

           // initAds();
            connecToBackand();
        }

        function initAds() {
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
                    admob.interstitial.prepare();
                    $timeout(function () {
                        admob.interstitial.show();
                    },30000)
                    //document.getElementById('showAd').disabled = true;
                    //document.getElementById('showAd').onclick = function () {
                    //    admob.interstitial.show();
                    //}

                }, false);

                document.addEventListener('admob.banner.events.LOAD_FAIL', function (event) {
                    $ionicPopup.alert({
                        title: 'Error: Loading AdMob Banner',
                        template: event
                    });
                });

                document.addEventListener('admob.interstitial.events.LOAD_FAIL', function (event) {
                    $ionicPopup.alert({
                        title: 'Error: Loading AdMob Interstitial',
                        template: event
                    });
                });

                document.addEventListener('admob.interstitial.events.LOAD', function (event) {
                    console.log(event);
                    console.log('Instetial loaded');
                    document.getElementById('showAd').disabled = true;
                });

                document.addEventListener('admob.interstitial.events.CLOSE', function (event) {
                    console.log(event);
                    admob.interstitial.prepare();
                })
                //registerAdEvents();
            } else {
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: AdMobAds plugin not ready',
                    template: error.message
                });
            }
        }

        ////////////////////////////////////////
        // Login to BackAnd
        ////////////////////////////////////////
        function connecToBackand() {
            backandAuthService.signin(ngAzureService.usernameBackAnd, ngAzureService.passwordBackAnd)
                .then(function () {
                    $rootScope.$broadcast('authorized');
                }, function (error) {
                    console.log(error)
                    $ionicPopup.alert({
                        title: 'Error: Backend',
                        template: error.message
                    });
                });
        };

        ////////////////////////////////////////
        // Layout Methods
        ////////////////////////////////////////

        $scope.hideNavBar = function () {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
        };

        $scope.showNavBar = function () {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
        };

        $scope.noHeader = function () {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };

        $scope.setExpanded = function (bool) {
            $scope.isExpanded = bool;
        };

        $scope.setHeaderFab = function (location) {
            var hasHeaderFabLeft = false;
            var hasHeaderFabRight = false;

            switch (location) {
                case 'left':
                    hasHeaderFabLeft = true;
                    break;
                case 'right':
                    hasHeaderFabRight = true;
                    break;
            }

            $scope.hasHeaderFabLeft = hasHeaderFabLeft;
            $scope.hasHeaderFabRight = hasHeaderFabRight;
        };

        $scope.hasHeader = function () {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (!content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }

        };

        $scope.hideHeader = function () {
            $scope.hideNavBar();
            $scope.noHeader();
        };

        $scope.showHeader = function () {
            $scope.showNavBar();
            $scope.hasHeader();
        };

        $scope.clearFabs = function () {
            var fabs = document.getElementsByClassName('button-fab');
            if (fabs.length && fabs.length > 1) {
                fabs[0].remove();
            }
        };

        //var navIcons = document.getElementsByClassName('ion-navicon');
        //for (var i = 0; i < navIcons.length; i++) {
        //    navIcons.addEventListener('click', function () {
        //        this.classList.toggle('active');
        //    });
        //}

        // .fromTemplate() method
        //var template = '<ion-popover-view>' +
        //                '   <ion-header-bar>' +
        //                '       <h1 class="title">My Popover Title</h1>' +
        //                '   </ion-header-bar>' +
        //                '   <ion-content class="padding">' +
        //                '       My Popover Contents' +
        //                '   </ion-content>' +
        //                '</ion-popover-view>';

        //$scope.popover = $ionicPopover.fromTemplate(template, {
        //    scope: $scope
        //});
        //$scope.closePopover = function () {
        //    $scope.popover.hide();
        //};
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
    }
})();
