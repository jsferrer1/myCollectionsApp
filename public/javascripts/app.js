'use strict';

angular.module('myCollectionsApp', ['ui.router','ngResource','ngDialog','facebook'])
.config(function(FacebookProvider) {
     // Set your appId through the setAppId method or
     // use the shortcut in the initialize method directly.
     var appId = '1575895849393383';
     FacebookProvider.init(appId);
})
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'partials/header',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'partials/home',
                        controller  : 'HomeController'
                    },
                    'footer': {
                        templateUrl : 'partials/footer',
                    }
                }

            })
        
            /**
             * Collections To Cash
             */

            // route for the collections page
            .state('app.collections', {
                url: 'collections',
                views: {
                    'content@': {
                        templateUrl : 'partials/collection',
                        controller  : 'CollectionController'
                    }
                }
            })

            // route for the collectiondetail page
            .state('app.collectiondetails', {
                url: 'collections/:id',
                views: {
                    'content@': {
                        templateUrl : 'partials/collectiondetail',
                        controller  : 'CollectionDetailController'
                   }
                }
            })

            // route for the new collection page
            .state('app.newcollection', {
                url:'new',
                views: {
                    'content@': {
                        templateUrl : 'partials/newcollection',
                        controller  : 'CollectionDetailController'                  
                    }
                }
            })

            // route for the edit collection page
            .state('app.editcollection', {
                url:'collections/:id/edit',
                views: {
                    'content@': {
                        templateUrl : 'partials/editcollection',
                        controller  : 'CollectionDetailController'                  
                    }
                }
            })

            ;
    
        $urlRouterProvider.otherwise('/');
    })

;
