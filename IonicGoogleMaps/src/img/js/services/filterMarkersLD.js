(function () {
    angular.module('driv.filterMarkersLD', [])
        .filter('filterMarkersLD', filterMarkersLD);
    function filterMarkersLD() {
        return function (items, search) {
            if (!search) {
                return items;
            }
            if (search === "LD") {
                return items;
            }
            return items.filter(function (item) {
                return item.mType === 'LD';
            });
        };
    };
})();