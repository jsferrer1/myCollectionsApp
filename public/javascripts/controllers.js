'use strict';

angular.module('myCollectionsApp')
.constant("baseURL", "http://mycollectionsapp-server.au-syd.mybluemix.net/")

// implement the IndexController and About Controller here
.controller('HomeController', ['$scope', 'collectionFactory', function ($scope, collectionFactory) {

    $scope.showCollection = false;
    $scope.message="Loading ...";
    $scope.filtText = "Sale";

    $scope.collections = collectionFactory.query({
            status: "Sale"
        },
        function(response) {
            $scope.collections = response;
            $scope.showCollection = true;
        },
        function(response) {
            $scope.message = "Error: "+response.status + " " + response.statusText;
        }
    );
}])

.controller('HeaderController', 
    ['$scope', '$state', '$rootScope', '$location', 'ngDialog', 'AuthFactory', 'Facebook', 
    function ($scope, $state, $rootScope, $location, ngDialog, AuthFactory, Facebook) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
        AuthFactory.logout();
        Facebook.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        console.log('login:Successful!');
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        console.log('$scope.loggedIn: ' + $scope.loggedIn);
        console.log('$scope.username: ' + $scope.username);
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };

}])

.controller('LoginController', 
    ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', 'Facebook',
    function ($scope, ngDialog, $localStorage, AuthFactory, Facebook) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };

    $scope.facebookLogin = function () {
        var promise = AuthFactory.fbLogin();
        promise.then(
            function(data){
              console.log(data);
            },
            function(error){
               console.log('Unable to connect with facebook');
            });
        
        ngDialog.close();
    };

    /**
     * Watch for Facebook to be ready.
     * There's also the event that could be used
     */

    $scope.$watch(function() {
      // This is for convenience, to notify if Facebook is loaded and ready to go.
      return Facebook.isReady();
    }, function(newVal) {
      // You might want to use this to disable/show/hide buttons and else
      $scope.facebookReady = true;
    });

}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])

.controller('CollectionDetailController', 
    ['$scope', '$http', '$state', '$stateParams', 'collectionFactory', 'AuthFactory', 'baseURL',
    function($scope, $http, $state, $stateParams, collectionFactory, AuthFactory, baseURL) {

    console.log('start CollectionDetailController.');
    $scope.showCollection = false;
    $scope.message="Loading ...";

    // for new collection
    $scope.collection = {name: "",
                         category: "" ,
                         image: "",
                         label: "",
                         price: 0,
                         description: "",
                         status: "New",
                         user: AuthFactory.getUsername(), 
                         location: "",
                         org: "",
                         comments: []
                        };

    var categories = [{value:"electronics", label:"Electronics"}, {value:"automobile",label:"Automobile"}, {value:"home",label:"Home"}, {value:"others",label:"Others"}];
    
    var locations = [{value:"livingroom", label:"Living Room"}, {value:"stockroom",label:"Stock Room"}, {value:"kitchen",label:"Kitchen"}, {value:"diningroom",label:"Dining Room"}, {value:"garage",label:"Garage"}, {value:"others",label:"Others"}];

    var labels = [{value:"hot", label:"Hot"}, {value:"new",label:"New"}];
    
    $scope.categories = categories;
    $scope.invalidCategorySelection = false;

    $scope.locations = locations;
    $scope.invalidLocationSelection = false;

    $scope.labels = labels;

    // get the collection details if parameter contains the id
    console.log('$stateParams.id: ' + $stateParams.id)
    if ($stateParams.id != null) {

        $scope.collection = collectionFactory.get({id:$stateParams.id})
            .$promise.then(
                        function(response){
                            $scope.collection = response;
                            $scope.showCollection = true;
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        }                    
                    );

    }

    $scope.uploadFile = function(element) {

        console.log('uploadFile: ' + element.files[0].name);
        var formdata = new FormData();
        formdata.append("imageFile", element.files[0]);

        // Upload the image file.
        //$http.post('https://localhost:3443/upload',
        $http.post(baseURL + 'upload/',
            formdata, 
            {withCredentials: false,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).then(
            function (response) {
                console.log(response);
                $scope.collection.image = response.data;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }; 

    // create a new collection
    $scope.addCollection = function() {

        if ($scope.collection.category === "" || $scope.collection.location === "") {

            console.log('incorrect category or location.');
            $scope.invalidCategorySelection = true;
            $scope.invalidLocationSelection = true;

        } else {

            console.log('Saving collection: ' + JSON.stringify($scope.collection));
            $scope.message="Saving ...";

            // create a new collection
            collectionFactory.save($scope.collection)
            .$promise.then(
                        function(response){
                            $scope.message = "Success: "+response;
                            console.log($scope.message);
                            $state.go('app.collections');
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                            console.log($scope.message);
                        }                    
                    );


            $scope.invalidChannelSelection = false;
            $scope.invalidLocationSelection = false;
            $scope.collection = {name:"", category:"", location:"", description:"", status:"" };
            $scope.collectionForm.$setPristine();
        }
    };

    // update an existing collection
    $scope.updateCollection = function(collectionId) {

        if ($scope.collection.category === "" || $scope.collection.location === "") {

            console.log('incorrect category or location.');
            $scope.invalidCategorySelection = true;
            $scope.invalidLocationSelection = true;

        } else {

            console.log('Saving collection: ' + JSON.stringify($scope.collection));
            $scope.message="Saving ...";

            // update collection
            collectionFactory.update({id: collectionId}, $scope.collection)
            .$promise.then(
                        function(response){
                            $scope.message = "Success: "+response;
                            console.log($scope.message);
                            $state.go('app.collections');
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                            console.log($scope.message);
                        }                    
                    );


            $scope.invalidChannelSelection = false;
            $scope.invalidLocationSelection = false;
            $scope.collection = {name:"", category:"", location:"", description:"", status:"" };
            $scope.collectionForm.$setPristine();
        }
    };

}])

.controller('CollectionCommentController', 
    ['$scope', '$stateParams', 'commentFactory', 
    function($scope, $stateParams, commentFactory) {
    
    // TODO: get the author from Login or Auth
    $scope.mycomment = {rating:5, comment:"", date:""};
    
    $scope.submitComment = function () {
        
        $scope.mycomment.date = new Date().toISOString();
        console.log($scope.mycomment);
        
        $scope.collection.comments.push($scope.mycomment);
        
        // new
        //collectionFactory.save({id:$stateParams.id},$scope.collection);
        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $scope.commentForm.$setPristine();
        
        $scope.mycomment = {rating:5, comment:"", date:""};
    };
}])

.controller('CollectionController', 
    ['$scope', '$state', '$window', 'collectionFactory', 'AuthFactory', 
    function($scope, $state, $window, collectionFactory, AuthFactory) {
    
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.filtCategory = '';
    $scope.showDetails = false;

    $scope.showCollection = false;
    $scope.message = "Loading ...";

    // for delete method
    $scope.curCollection = {};

    // for donation
    var orgs = [{value:"dswd", label:"DSWD"}, {value:"smallworld",label:"Small World"}, {value:"church",label:"Family Church"}];
    $scope.orgs = orgs;

    // list collections
    var username = AuthFactory.getUsername();
    $scope.collections = collectionFactory.query({user: username},
        function(response) {
            $scope.collections = response;
            $scope.showCollection = true;
        },
        function(response) {
            $scope.message = "Error: "+response.status + " " + response.statusText;
        }
    );
                
    $scope.select = function(setTab) {
        $scope.tab = setTab;
        
        if (setTab === 2) {
            $scope.filtCategory = "electronics";
        }
        else if (setTab === 3) {
            $scope.filtCategory = "automobile";
        }
        else if (setTab === 4) {
            $scope.filtCategory = "home";
        }
        else if (setTab === 5) {
            $scope.filtCategory = "others";
        }
        else {
            $scope.filtCategory = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function() {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.setCollection = function(collection) {
        console.log('setCollection: name=' + collection.name);
        $scope.curCollection = collection;

    };

    $scope.deleteCollection = function(collectionId) {

        collectionFactory.delete({id: collectionId})
        .$promise.then(
                    function(response){
                        $scope.message = "Success: "+response;
                        console.log($scope.message);
                        $state.go($state.current, {}, {reload:true}).then(function() {
                            $window.location.reload(true);
                        });
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                        console.log($scope.message);
                    }                    
                );


    };

    $scope.sellCollection = function(collectionId) {

        $scope.curCollection.status = 'Sale';
        console.log('sellCollection: ' + JSON.stringify($scope.curCollection));
        collectionFactory.update({id: collectionId}, $scope.curCollection)
        .$promise.then(
                    function(response){
                        $scope.message = "Success: "+response;
                        console.log($scope.message);
                        $state.go($state.current, {}, {reload:true}).then(function() {
                            $window.location.reload(true);
                        });
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                        console.log($scope.message);
                    }                    
                );


    };

    $scope.donateCollection = function(collectionId) {

        $scope.curCollection.status = 'Donate';
        console.log('donateCollection: ' + JSON.stringify($scope.curCollection));
        collectionFactory.update({id: collectionId}, $scope.curCollection)
        .$promise.then(
                    function(response){
                        $scope.message = "Success: "+response;
                        console.log($scope.message);
                        $state.go($state.current, {}, {reload:true}).then(function() {
                            $window.location.reload(true);
                        });
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                        console.log($scope.message);
                    }                    
                );


    };

    $scope.postToFB = function(collection) {
        console.log('Post to facebook: ', collection.name);
        AuthFactory.postToFB(collection);
    };

}])
;