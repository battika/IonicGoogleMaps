(function () {
    angular.module('driv.nobilCSService', [])
                .service('nobilCSService', nobilCSService);

    nobilCSService.$inject = ['$http', '$q'];

    function nobilCSService($http, $q) {
        var nobilApiKey = '501abed701f4b59dc45364900bd6a53a';

        var getNearByCS = function (lat,long) {
            var d = $q.defer();
            jQuery.ajax({
                type: 'POST',
                url: 'http://nobil.no/api/server/search.php',
                data: {
                    'apikey': nobilApiKey,
                    'apiversion': '3',
                    'action': "search",
                    'type': 'near',
                    'lat': lat,
                    'long': long,
                    'distance': '10000',
                    'limit': '500'
                },
                success: printJsonResponse,
                error: error,
                dataType: 'json'
            })
            function printJsonResponse(res) {
                d.resolve(res);
            }
            function error(error) {
                d.reject(error);
            }
            return d.promise;
        }

        var getChargingPointDetails = function (Iid) {
            var d = $q.defer();
            jQuery.ajax({
                type: 'POST',
                url: 'http://nobil.no/api/server/search.php',
                data: {
                    'apikey': nobilApiKey, 'apiversion': '3', 'action': "search",
                    'type': 'id', 'id': Iid
                },
                success: printJsonResponse,
                dataType: 'json'
            })
            function printJsonResponse(data) {
                d.resolve(data);
            }
            function error(error) {
                d.reject(error);
            }
            return d.promise;
        }

        return {
            getNearByCS: getNearByCS,
            getChargingPointDetails: getChargingPointDetails
        }
    }
})();