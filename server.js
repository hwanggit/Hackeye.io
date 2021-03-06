// Store hackaday API data
global.apiData = {};
apiData.clientId = ***HIDDEN*** ;
apiData.clientSecret = ***HIDDEN*** ;
apiData.userKey = ***HIDDEN*** ;

// Create API URLs:
apiData.apiKey = '?api_key=' + apiData.userKey;
apiData.apiUrl = 'https://api.hackaday.io/v1';
apiData.apiAuthUrl = 'https://api.hackaday.io/v1/me' + apiData.apiKey;
apiData.oAuthRedirect = 'https://hackaday.io/authorize?client_id=' + apiData.clientId + '&response_type=code';
apiData.createTokenUrl = function (code) {
    return ('https://auth.hackaday.io/access_token?' +
        'client_id=' + this.clientId +
        '&client_secret=' + this.clientSecret +
        '&code=' + code +
        '&grant_type=authorization_code');
};

// Load express, bodyparse, debug, fs and request modules
const request = require('request');
const debug = require('debug')('http')
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const app = express();

// Enable EJS
app.set('views', './views');
app.set('view engine', 'ejs');

// Include static files and enable body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

// Open on port 8000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Running on localhost: ' + port + '...');
});

// Render title page
app.get('/', (req, res) => {
    res.render('index');
});

// Render loading page
app.get('/loading', (req, res) => {
    res.render('loading');
});

// Render nth projects page 
app.get('/projects/:pg', (req, res) => {
   // construct url to get first project page
   var pgNum = req.params.pg;
   var perPage = 50;

   // Sort search by number of views
   var url = global.apiData.apiUrl + '/projects' + global.apiData.apiKey + '&per_page='+ perPage + '&page=' + pgNum + '&sortby=views';

   // Make api call
   request.get(url, (error, response, body) => {
       // If successful, render JSON data
       if (!error && response.statusCode === 200 && pgNum > 0 && pgNum <= JSON.parse(body)['last_page']) {
           var projData = JSON.parse(body);
           var projArr = projData['projects'];

           // add debug statement
           debug(projArr);

           // Render data in ejs
           res.render('projects', {
               projects: projArr,
               maxPages: projData['last_page'],
               perpage: perPage
           });

       }
       else {
           res.send("Projects not found. Please specify a page range between [1, " + JSON.parse(body)['last_page'] + "]");
       }
   });
});

// All other redirect to main
app.get('*', (req, res) => {
    res.redirect('/');
});




