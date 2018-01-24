(function () {
    "use strict";
    angular.module('driv.httpInterceptor', [])
                .service('httpInterceptor', httpInterceptor);

    httpInterceptor.$inject = ['$cookieStore'];
    function httpInterceptor($cookieStore) {
        return {
            request: function (config) {
                config.headers['Authorization'] =
                  $cookieStore.get('backand_token');
                return config;
            }
        };
        // var service = this;

        //service.responseError = function (response) {
        //    if (response.status === 401) {
        //        $rootScope.$broadcast('unauthorized');
        //    }
        //    return $q.reject(response);
        //};
    }
})();