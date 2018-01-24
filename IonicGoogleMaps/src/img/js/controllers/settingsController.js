(function () {
    angular.module('driv.settingsController', [])
        .controller('settingsController', settingsController);

    settingsController.$inject = ['$scope', '$state', '$rootScope', '$timeout', '$q', 'ionicMaterialMotion', 'ionicMaterialInk', '$ionicPlatform', '$ionicListDelegate', '$ionicLoading', 'ngAzureService', '$ionicPopup','$translate']

    function settingsController($scope, $state, $rootScope, $timeout, $q, ionicMaterialMotion, ionicMaterialInk, $ionicPlatform, $ionicListDelegate, $ionicLoading, ngAzureService, $ionicPopup,$translate) {

        $scope.$parent.showHeader();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);

        $scope.shouldShowDelete = false;
        $scope.listCanSwipe = true;
        var db = null;

        $scope.drivTypeList = [
             { text: "Bensinstasjoner", value: "BN" },
             { text: "Ladestasjoner", value: "LD" },
             { text: "Begge deler", value: "BG" }
        ];

        $scope.drivCountries = [
             { text: "Norge", value: "nb" },
             { text: "Sverige", value: "sv" },
             { text: "Finland", value: "fi" }
        ];

        $scope.data = {};
        $scope.dataCountry = {};

        $scope.$on("$ionicView.enter", function () {
            try {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                    content: 'Laster opp kart...',
                    showBackdrop: false
                });
                document.addEventListener("deviceready", openDb, false);

                document.addEventListener('admob.interstitial.events.LOAD_FAIL', function (event) {
                    $ionicPopup.alert({
                        title: 'Error: Loading AdMob Interstitial',
                        template: event
                    });
                });

                document.addEventListener('admob.interstitial.events.LOAD', function (event) {
                    document.getElementById('showAd').disabled = true;
                });

                document.addEventListener('admob.interstitial.events.CLOSE', function (event) {
                    admob.interstitial.prepare();
                });

                getAllSettings();
            }
            catch (exception) {
                $ionicLoading.hide();
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: Search',
                    template: exception
                });
            }
        })

        $scope.selectedBens = function (item) {
            if (item !== null && item !== undefined) {
                db.transaction(function (tx) {
                    db.executeSql("UPDATE settings SET value = ? WHERE id =?",
                                  [item.value, $scope.data.id],
                                  function () {
                                      getAllSettings();
                                      $ionicLoading.hide();
                                  },
                                 function (e) {
                                     $ionicLoading.hide();
                                 });
                });

                $timeout(function () {
                    //admob.requestInterstitialAd();
                    admob.interstitial.show();
                }, 5000);
            }
        }

        $scope.selectedCountry = function (item) {
            if (item !== null && item !== undefined) {
                $translate.use(item.value);
                db.transaction(function (tx) {
                    db.executeSql("UPDATE settings SET value = ? WHERE id =?",
                                  [item.value, $scope.dataCountry.id],
                                  function () {
                                      getAllSettings();
                                      $ionicLoading.hide();
                                  },
                                 function (e) {
                                     $ionicLoading.hide();
                                 });
                });

                $timeout(function () {
                    //admob.requestInterstitialAd();
                    admob.interstitial.show();
                    //AdInterstitial();
                }, 5000);
            }
        }

        $scope.getAllSettings = function () {
            db.transaction(function (tx) {
                db.executeSql("SELECT id,title,value FROM settings",
                              [],
                              function (res) {
                                  for (var i = 0; i < res.rows.length; i++) {
                                      var item = res.rows.item(i);
                                      if (item.title === 'drivType') {
                                          $scope.data = { id: item.id, clientSide: item.value }
                                      }
                                      if (item.title === 'drivCountry') {
                                          $scope.dataCountry = {
                                              countryVal: item.value
                                          }
                                      }
                                      
                                      console.log(JSON.stringify($scope.data));
                                  }
                                  $ionicPopup.alert({
                                          title: 'Driv Type:',
                                          template: $scope.data.clientSide+' ,'+ $scope.dataCountry.countryVal
                                      });
                              },
                              function (e) {
                                  $ionicLoading.hide();
                              });
            });
        }

        var getAllSettings = function () {
            db.transaction(function (tx) {
                db.executeSql("SELECT id,title,value FROM settings",
                              [],
                              function (res) {
                                for (var i = 0; i < res.rows.length; i++) {
                                          var item = res.rows.item(i);
                                          if (item.title === 'drivType') {
                                              $scope.data = { id: item.id, clientSide: item.value }
                                              $rootScope.data = { id: item.id, title: item.title, value: item.value }
                                          }
                                          if (item.title === 'drivCountry') {
                                              $scope.dataCountry = {
                                                  id: item.id,
                                                  countryVal: item.value
                                              }
                                              $rootScope.country = {
                                                  title: item.title, value: item.value
                                              }
                                          }
                                          $ionicLoading.hide();
                                      }
                              },
                              function (e) { 
                                $ionicLoading.hide();
                              });
            });
        }

        var openDb = function () {
            if (window.sqlitePlugin !== undefined) {
                db = window.sqlitePlugin.openDatabase({ name: 'driv.db', iosDatabaseLocation: 'default' });
            }
            admob.interstitial.prepare();
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