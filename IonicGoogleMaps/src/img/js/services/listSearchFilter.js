(function () {
    angular.module('driv.listSearchFilter', [])
        .filter('listSearchFilter', listSearchFilter);

    function listSearchFilter() {
        return function (items, search) {
            if (!search) {
                return items;
            }

            return items.filter(function (item) {
                return item.name === search || item.city === search;
            });
        };
    };
})();