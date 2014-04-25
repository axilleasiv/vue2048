(function (exports) {

    'use strict';

    var STORAGE_KEY = 'game2048';

    exports.gameStorage = {
        fetch: function () {
        	console.log('fetch');

            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        save: function (tiles) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
        }
    };

})(window);