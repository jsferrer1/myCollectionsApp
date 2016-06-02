'use strict';

angular.module('myCollectionsApp')
.constant("baseURL", "http://mycollectionsapp-server.au-syd.mybluemix.net/")
.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "collections/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])

.factory('AuthFactory', 
    ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', 'Facebook', '$q', 
    function($resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog, Facebook, $q){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken = undefined;
    

  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }

  function generateToken(loginData) {

      $resource(baseURL + "users/token")
      .save(loginData,
         function(response) {
            console.log('generateToken: success: ' + response);
            storeUserCredentials({username:loginData.username, token: response.token});
            $rootScope.$broadcast('login:Successful');
         },
         function(response){
            isAuthenticated = false;
          
            console.log('generateToken: error: ' + response);
         }
      
      );

  }
     
    authFac.login = function(loginData) {
        
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              console.log('authFac.login: success: ' + response);
              storeUserCredentials({username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');
           },
           function(response){
              isAuthenticated = false;
            
              console.log('authFac.login: error: ' + response);
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>'
            
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
        
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
           
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    /**
     * facebook authentication
     */

    authFac.fbLogin = function() {
        //$('.btn-disable').addClass('disabled');
        var deferred = $q.defer();
        Facebook.login(function(response) {
            if(response.status === "connected") {
                console.log(response.authResponse);
                var accessToken = response.authResponse.accessToken;
                Facebook.api('/me?fields=email,name,id', function(response) {
                        console.log(response);
                        if(!response || response.error) {
                            deferred.reject('Error occured');
                        } else {

                          //deferred.resolve(response);
                          console.log('authFac.fbLogin: response.email: ' + response.email);

                          // generate a jwt token
                          var username = response.email.split('@')[0];
                          generateToken({username:username, email:response.email});

                        }
                    }
                );
            } else {
                //$('.btn-disable').removeClass('disabled');
            }
        },{
            auth_type: 'rerequest',
            scope: 'email, public_profile, publish_actions'
        });
        return deferred.promise;
    };

    authFac.postToFB = function(obj) {

        var postmessage = obj.name + ' - ' + obj.label + ' for only ' + obj.price/100 + '!';
        var data = {
            message: postmessage,
            link: obj.image
        };        
        Facebook.api('/me/feed', 'post', data, function(response) {
          console.log('Facebook.api response: ', response);
        });
    };

    loadUserCredentials();
    
    return authFac;
}])


.service('collectionFactory', ['$resource', 'baseURL', function($resource, baseURL) {

    return $resource(baseURL + "collections/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])


;