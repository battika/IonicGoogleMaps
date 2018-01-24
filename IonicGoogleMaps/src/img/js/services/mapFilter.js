(function () {
    angular.module('driv.mapFilter', [])
        .filter('mapFilter', mapFilter);
    function mapFilter() {
        return function (elItems, search) {
            if (!search) {
                return elItems;
            }
            if (search === "All") {
                return elItems;
            }
            return elItems.filter(function (item) {
                return item.csType === search || item.mType === 'BN';
            });
        };
    };
})();