(function () {
    angular.module('driv.selectFilterModal', [])
        .directive('raw', ['$sce', function ($sce) {
            var directive = {
                replace: true,
                scope: {
                    src: '='
                },
                template: '<pre class="code" ng-bind-html="data"></pre>',
                restrict: 'E',
                link: function (scope, element) {
                    var template = angular.element(document.getElementById(scope.src));
                    scope.data = $sce.trustAsHtml(element.text(template.html()).html());
                }
            };
            return directive;
        }])

        .controller('selectFilterModal', selectFilterModal)

    selectFilterModal.$inject = ['$scope'];

    function selectFilterModal($scope) {
        $scope.drivFilterTypeList = [
            { text:"Alle", value: "All"},
            { text: "Normal lading", value: "Mode 1" },
            //{ text: "Normal (adapter)", value: "Mode 2" },
            { text: "Hurtiglading", value: "Mode 3" },
            { text: "DC Hurtiglading (CHAdeMO)", value: "Mode 4" }
        ];

        $scope.selectedFilter = function (item) {
            $scope.closeThisDialog(item);
        }
     
    }
})();
