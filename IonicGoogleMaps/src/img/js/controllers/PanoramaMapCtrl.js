(function () {
    angular.module('driv.PanoramaMapCtrl', [])
            .controller('PanoramaMapCtrl', PanoramaMapCtrl);

    PanoramaMapCtrl.$inject = ['$scope', '$rootScope', '$state', '$ionicPopup', '$stateParams', '$ionicLoading', '$ionicHistory','$ionicPlatform'];


    function PanoramaMapCtrl($scope, $rootScope, $state, $ionicPopup, $stateParams, $ionicLoading, $ionicHistory, $ionicPlatform) {
        var panorama;
        var outsideGoogle;
        $scope.$on("$ionicView.enter", function () {
            try {
                $ionicPlatform.ready(function () {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>',
                        content: 'Laster opp kart...',
                        showBackdrop: false
                    });

                    var pos = $state.params.pos;
                    var arr = pos.replace(/[^\d,.]/g, "").split(",");
                    $scope.cslat = arr[0];
                    $scope.cslong = arr[1];
                    initialize($scope.cslat, $scope.cslong);
                    $ionicLoading.hide();
                });
            }
            catch (exception) {
                $ionicLoading.hide();
                var errorPopup = $ionicPopup.alert({
                    title: 'Error: PanoR',
                    template: exception
                });
            }
        });

        $scope.$on("$ionicView.beforeLeave", function () {
            //$ionicHistory.clearCache();
            //$ionicHistory.clearHistory();
        });

        $rootScope.$ionicGoBack = function () {
           $ionicHistory.goBack();
        };

        var initialize = function (lat, long) {
            var streetviewService = new google.maps.StreetViewService;
            var streetViewLocation = new google.maps.LatLng(lat, long);
            streetviewService.getPanoramaByLocation(streetViewLocation, 50,
                function (result, status) {
                    if (status === 'OK') {
                        outsideGoogle = result;
                        initPanorama();
                    }
                    if (status === "ZERO_RESULTS") {
                        var errorPopup = $ionicPopup.alert({
                            title: 'Info',
                            template: '<span>Fant ingen gate bilder for denne ladestasjonen.</span>',
                            buttons: [
                              {
                                  text: '<b>Ok</b>',
                                  type: 'button-positive',
                                  onTap: function (e) {
                                      $ionicHistory.goBack();
                                  }
                              }
                            ]
                        });
                        $ionicLoading.hide();
                    }
                });
        }

        var initPanorama = function () {
            panorama = new google.maps.StreetViewPanorama(
                document.getElementById('street-view'),
                {
                    pano: outsideGoogle.location.pano,
                    motionTrackingControlOptions: {
                        position: google.maps.ControlPosition.LEFT_BOTTOM
                    }
                });

            panorama.addListener('links_changed', function () {
                if (panorama.getPano() === outsideGoogle.location.pano) {
                    panorama.getLinks().push({
                        description: 'Charging station',
                        heading: 25,
                        pano: outsideGoogle.location.pano
                    });
                }
            });
        }
    }
})();
