'use strict';

var services = angular.module('app.services');

services.factory('Menus', ['$resource', function($resource) {
    return $resource('admin/menu/:name', {
        name: '@name',
        defaultMenu: '@defaultMenu'
    });
}]);


//Global service for global variables
services.factory('Global', [

    function() {
        var _this = this;
        _this._data = {
            user: window.user,
            authenticated: false,
            isAdmin: false
        };
        if (window.user && window.user.roles) {
            _this._data.authenticated = window.user.roles.length;
            _this._data.isAdmin = ~window.user.roles.indexOf('admin');
        }
        return _this._data;
    }
]);
