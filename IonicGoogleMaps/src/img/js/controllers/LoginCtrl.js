(function () {
    angular.module('driv.LoginCtrl', [])
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$scope', '$rootScope', '$state', 'loginService'];

    function LoginCtrl($scope, $rootScope, $state, loginService) {

        $rootScope.isAuthorized = false;

        $scope.signin = function (email, password) {
            loginService.signin(email, password)
                .then(function (res) {
                    console.log(res);
                    onLogin(email);
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Error: signin',
                        template: error.message
                    });
                });
        }

        $scope.anonymousLogin = function () {
            loginService.anonymousLogin();
            onLogin();
        }

        function onLogin(email) {
            $rootScope.$broadcast('authorized');
            $scope.email = '';
            $scope.password = '';
            $rootScope.isAuthorized = true;
            $state.go('app.main');
        }

        $scope.signout = function () {
            loginService.signout()
                .then(function () {
                    $scope.email = '';
                    $scope.password = '';
                    $rootScope.isAuthorized = false;
                    $rootScope.$broadcast('logout');
                    $state.go('app.main');
                });
        }

        $rootScope.$on('authorized', function () {
            $rootScope.isAuthorized = true;
        });


        $rootScope.$on('logout', function () {
            clearData();
        });


        function clearData() {
            //vm.data = null;
        }
    }
})();
