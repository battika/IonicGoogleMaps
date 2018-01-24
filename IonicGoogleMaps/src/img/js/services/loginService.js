(function () {
    "use strict";
    angular.module('driv.loginService', [])
        .service('loginService', loginService);

    loginService.$inject = ['Backand'];

    function loginService(Backand) {

        var signin = function (email, password, appName) {
            //call Backand for sign in
            return Backand.signin(email, password);
        };

        var anonymousLogin = function () {
            // don't have to do anything here,
            // because we set app token att app.js
        }

        var signout = function () {
            return Backand.signout();
        };

        return {
            signin: signin,
            signout: signout,
            anonymousLogin: anonymousLogin
        }
    };
})();