'use strict';

var express = require('express');
var router = express.Router();
var mustacheExpress = require('mustache-express');
var icons = require('glyphicons');
var jwt = require('jsonwebtoken');
var querystring = require('querystring');
var http = require('http');

var secret = process.env.TOKENS_KSOTD || 'shhhhh';
var phrase = process.env.PHRASE_KSOTD || 'hakunamatata';

var apiCall = function(path, method, signedToken, data, successCallbackFunction, errorCallbackFunction) {
    let host = process.env.API || 'api.keyboardshortcutoftheday.com';
    let port = process.env.API_PORT || '80';
    let headers = {'X-API-Key': signedToken};
    let dataString = JSON.stringify(data);
    if(method === 'GET' && data) {
        path += '?' + querystring.stringify(data);
    } else {
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
            'X-API-Key': signedToken
          };
    }
    let options = {
        host,
        port,
        path,
        method,
        headers,
        timeout: 50
      };
      try {
            let req = http.request(options, function(res){
            
            res.setEncoding('utf-8');
            var responseString = '';

            res.on('data', function(data){
                     responseString += data;
                 });

            res.on('end', function(){
                     if(responseString) {
                         let responseObject = JSON.parse(responseString);
                         if(responseObject.message) {
                            errorCallbackFunction(responseObject, req);
                             return;
                         }
                         successCallbackFunction(responseObject);
                     } else {
                        errorCallbackFunction('No response', req);
                     }
                 });
            });
            
            req.on('error', err);
            req.write(dataString);
            req.end();
        } catch (error) {
            err('Api calls are broken', error);
        }
}

var emptyShortcut = {
    message: 'Not yet'
};

router.get('/', function (req, res) {
    var signed = jwt.sign({ phrase }, secret, { expiresIn: '1h'});
    
    process.on('uncaughtException', function(anErr) {
        // handle the error safely
        res.render('error', { token: signed, message: 'Unhandled error ' + annErr.message});
    })

    apiCall('/shortcuts/1', 'GET', signed, null, 
        function (aShortcut) {
            shortcut = aShortcut || emptyShortcut;
            res.render('index', { title: 'Keyboard shortcut of the day', dissa: icons.ticket, token: signed, 'shortcut' : JSON.stringify(shortcut), 'description': shortcut.description, stitle: shortcut.title, vendor: shortcut.vendor, product: shortcut.product, keys: shortcut.keycombo, documentation: shortcut.documentation });
        },
        function(error, req){
            res.render('error', { message: error.message, token: signed});
        });
});
  
var app = express();
app.use(express.static('public'));
app.engine('html', mustacheExpress());
app.set('views', 'views');
app.set('view engine', 'html');
app.use('/js', [express.static(__dirname + '/node_modules/jquery/dist/'),
                express.static(__dirname + '/node_modules/bootstrap/dist/js/'),
                express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js/'),
                express.static(__dirname + '/node_modules/popper.js/dist/')]);
app.use('/css', [express.static(__dirname + '/node_modules/bootstrap/dist/css/'),
                express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css/')]); 
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts/'));
app.use('/sprites', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/sprites/'));
app.use('/svg', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/svg/'));
app.use('/', router);

app.listen(process.env.PORT || 8080);