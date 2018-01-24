(function () {
    "use strict";
    angular.module('driv.backandAuthService', [])
                .service('backandAuthService', backandAuthService);

    backandAuthService.$inject = ['Backand'];
    function backandAuthService(Backand){
         var service = this;
         var appName = "driv";
            service.signin = function (email, password, appName) {
                //call Backand for sign in
                return Backand.signin(email, password);
            };

            service.anonymousLogin= function(){
                // don't have to do anything here,
                // because we set app token att app.js
            }

            service.signout = function () {
                return Backand.signout();
            };
    }

})();