(function () {
    angular.module('driv.listELSearchFilter', [])
        .filter('listELSearchFilter', listELSearchFilter);
    function listELSearchFilter() {
        return function (elItems, search) {
            if (!search) {
                return elItems;
            }

            if (search === "All") {
                return elItems;
            }

            return elItems.filter(function (item) {
                return item.ldType === search;
            });
        };
    };
})();