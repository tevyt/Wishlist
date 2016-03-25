'use strict';

var wishListApp = angular.module('wishListApp', ['ngRoute' , 'ngCookies']).
run(function($cookies){
    if(!$cookies.get('loggedIn')){
        $cookies.put('loggedIn' , false);
    }
});

wishListApp.controller('SignUpController' , ['$scope' , '$http', '$log', '$location',
        function($scope , $http, $log, $location){
            $scope.user = {};
            $scope.validate = function(){
                $http.post('/signup' , $scope.user).
                    success(function(data , status){
                        $location.path('/login');
                    }).
                error(function(data , status){
                    $log.log('Status: ' + status);
                    $log.log('Data: ' +JSON.stringify(data));
                });
            };
        }]);

wishListApp.controller('LoginController' , ['$scope', '$cookies', '$http', '$log', '$location',
        function($scope , $cookies, $http, $log, $location){
            $scope.credentials = {};
            $scope.login = function(){
                $http.post('/login' , $scope.credentials).
                    success(function(data , status){
                        $cookies.put('loggedIn' , true);
                        $cookies.put('authToken' , data.token);
                        $cookies.put('currentUserId' , data.id);
                        $cookies.put('currentUserName' , data.firstname);
                        $location.path('/friends');
                    }).
                error(function(data , status){
                    $log.log(JSON.stringify(data));
                });
            };
        }]);

wishListApp.controller('FriendsController' , ['$scope', '$http', '$log', '$cookies','$location',
        function($scope, $http , $log, $cookies, $location){
            $scope.$on('$routeChangeSuccess' , function(event , current){
                $http.get('/wishlist').
                    success(function(data , status){
                        $scope.users = data;
                    }).
                error(function(data , status){
                    $log.log(JSON.stringify(data));
                });
            });
            $scope.getWish = function(id){
                $cookies.put('selectedUser' , id)
                $location.path('/wishlist')
            };

            $scope.currentUser = function(id){
                return $cookies.get('currentUserId') == id
            }
        }]);

wishListApp.controller('WishListController' , ['$scope' , '$cookies' , '$http' , '$location', '$log',
        function($scope , $cookies, $http, $location, $log){
            if($cookies.get('selectedUser')){
                $scope.id = $cookies.get('selectedUser')
                $cookies.remove('selectedUser');
            }else if($cookies.get('currentUserId')){
                $scope.id = $cookies.get('currentUserId');
            }else{
                $location.path('/login');
            }
            $http.get('/wishlist/' + $scope.id).
                success(function(data , status){
                    $scope.firstname = data.firstname;
                }).
                error(function(data , status){
                    $log.log(JSON.stringify(data))
                });
            $scope.currentUser = function(){
                return $scope.id == $cookies.get('currentUserId');
            }
            $scope.openAddItemForm = function(){
                $location.path('/new');
            };
        }]);

wishListApp.controller('NewItemController' , ['$scope' , '$cookies', '$log', '$location',
        function($scope , $cookies , $log, $location){
            if($cookies.get('loggedIn') === 'true'){
                $log.log('Logged In');
            }else{
                $location.path('/login');
            }
        }]);
wishListApp.config(function($routeProvider){
    $routeProvider.when('/signup',{
        templateUrl: 'static/js/partials/sign_up.html',
        controller: 'SignUpController',
    }).
    when('/login' , {
        templateUrl: 'static/js/partials/login.html',
        controller: 'LoginController'
    }).
    when('/friends', {
        templateUrl: 'static/js/partials/friends.html',
        controller: 'FriendsController'
    }).
    when('/wishlist', {
        templateUrl: 'static/js/partials/wishlist.html',
        controller: 'WishListController'
    }).
    when('/new' , {
        templateUrl: 'static/js/partials/new.html',
        controller: 'NewItemController'
    }).
    otherwise({
        redirectTo: '/login'
    })
});
