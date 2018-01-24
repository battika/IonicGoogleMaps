(function () {
    angular.module('driv.SearchMapCtrl', [])
            .controller('SearchMapCtrl', SearchMapCtrl);

    SearchMapCtrl.$inject = ['$scope', '$state', '$ionicPopup','$stateParams'];


    function SearchMapCtrl($scope,$state, $ionicPopup, $stateParams) {
     $scope.state = $state.current
     $scope.params = $stateParams;
    
        var cp = $stateParams.lat;
    }

})();
