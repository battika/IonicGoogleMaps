(function () {
    "use strict";
    angular.module('driv.backAndService', [])
                .service('backAndService', backAndService);

    backAndService.$inject = ['Backand', '$http'];
    function backAndService(Backand, $http) {
        var baseUrl = '/1/objects/';

        var getPrices = function (placeId) {
            var query = 'GetPricesWhere';
            return $http({
                method: 'GET',
                url: Backand.getApiUrl() + '/1/query/data/' + query,
                params: {
                    parameters: {
                        place_id: placeId
                    }
                }
            }, function (error) {
                $ionicPopup.alert({
                    title: 'GetPrices service:' + error.status,
                    template: error.statusText
                });
                $ionicLoading.hide();
            });
        }

        var addDefPrices = function (data) {
            return $http({
                method: 'POST',
                url: Backand.getApiUrl() + '/1/objects/' + 'Prices',
                data: data,
                params: {
                    returnObject: true
                }
            })
        }

        var insertGasStation = function (data) {
            return $http({
                method: 'POST',
                url: Backand.getApiUrl() + '/1/objects/' + 'Gas_Stations',
                data: data
            })
        }

        var updatePrice = function (data,id) {
             var itemId = id;
            return $http({
                method: 'PUT',
                url: Backand.getApiUrl() + baseUrl +  '/Prices/' + itemId,
                data: data,
                params: {
                    returnObject: true
                }
            })
        }

        return {
            getPrices: getPrices,
            addDefPrices: addDefPrices,
            insertGasStation:insertGasStation,
            updatePrice: updatePrice
        }
    }
})();