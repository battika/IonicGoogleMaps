(function () {
    angular.module('driv.filterMarkersBN', [])
        .filter('filterMarkersBN', filterMarkersBN);
    function filterMarkersBN() {
        return function (items, search) {
            if (!search) {
                return items;
            }
            if (search === "BN") {
                return items;
            }
            return items.filter(function (item) {
                return item.mType === 'BN';
            });
        };
    };
})();