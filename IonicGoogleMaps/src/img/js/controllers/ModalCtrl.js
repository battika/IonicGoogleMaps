(function () {
    angular.module('driv.ModalCtrl', [])
            .controller('ModalCtrl', ModalCtrl);

    ModalCtrl.$inject = ['$scope'];

    function ModalCtrl($scope) {
       
        $scope.numberPickerObject = {
            inputValue: 0, //Optional
            minValue: -9007199254740991,
            maxValue: 9007199254740991,
            precision: 3,  //Optional
            decimalStep: 0.25,  //Optional
            format: "DECIMAL",  //Optional - "WHOLE" or "DECIMAL"
            titleLabel: 'Number Picker',  //Optional
            setLabel: 'Set',  //Optional
            closeLabel: 'Close',  //Optional
            setButtonType: 'button-positive',  //Optional
            closeButtonType: 'button-stable',  //Optional
            callback: function (val) {    //Mandatory
                timePickerCallback(val);
            }
        };

        $scope.hideModal = function () {
            $scope.modalCtrl.hide();
        };
        $scope.removeModal = function () {
            //$scope.modalCtrl.remove();
        };
    }
})();
