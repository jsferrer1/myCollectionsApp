# My Collections To Cash Web App

<img src="public/images/logo.png" alt="myCollections"><br>

My Collections to Cash would enable a user to have an overall view of their assets. Assets are also known as "collections" or "stuffs" or "items." This web app was implemented using MEAN stack in order to leverage on the power of the MVC framework.


## Features 

a) Login using Passport

b) Login using Facebook

   Use this feature to post collections to facebook.

b) Collections on Sale

c) Collections: create, read, update, delete

d) Add Collection Comments

e) Sell Collections

   This will add the collections to the lists of collections on sale.

f) Post Collections to Facebook

   User must be logged into facebook to use this feature.

g) Donate Collections

h) Search



## App Preview


<!-- GIF of Android app -->
<img src="resources/gifs/myCollections-web.gif" alt="web"><br>


## Implementation

mycollectionsapp is a front-end express-angular application that includes a lot of features including: facebook login, image upload, and REST server. 

For modularity purposes, the back-end REST  server was separated at http://mycollectionsapp-server.au-syd.mybluemix.net/.

Both front-end and back-end applications was implemented in bluemix.


## Directory Structure

```
mycollectionsapp
+---bin
+---public
|   +---images
|   +---javascripts
|   +---stylesheets
|   +---uploadedfiles
|   \---views
+---resources
|   \---gifs
+---routes
\---views
    \---partials
```

## Run Locally

This assumes you already have the following tools installed: node, npm, bower, gulp, and git.

    git clone https://github.com/jsferrer1/myCollectionsApp.git mycollectionsapp

    cd mycollectionsapp

    npm install

    bower install

    gulp watch


## LICENSE

npm is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.
