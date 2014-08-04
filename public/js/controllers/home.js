'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('HomeController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
    // console.log('In HomeController. $stateParams.view', $stateParams.view);

    var view = $stateParams.view;
    view = view ? view : 'map';

    // console.log('changeing to home state:', view);
    $state.go('home.' + view);


}]);
/*
EVENTS MODELS
var properties = _.extend({
    name: String,
    type: String, // Activity, Exhibit, Tour, Program/Festival
    description: String,
    visibility: String, //Private/Public
    setupDateTime: Date,
    startDateTime: Date,
    endDateTime: Date,
    cleanupDateTime: Date,
    isReccuring: Boolean,
    anticipatedAttendance: Number,
    location: String,
    geoLocation: {type: [Number], index: '2d'},
    media: [{type: ObjectId, ref: 'Media'}]
}, base.properties);

*/
controllers.controller('LandingController', ['$scope','$location', 'NavService',function($scope, $location, NavService){
    console.log('In LandingController');

}]);