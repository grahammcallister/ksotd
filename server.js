var express = require('express');
var router = express.Router();
var mustacheExpress = require('mustache-express');
var humanize = require('humanizer');
var icons = require('glyphicons');
var jwt = require('jsonwebtoken');
var querystring = require('querystring');
var http = require('http');

var secret = process.env.TOKENS_KSOTD || 'shhhhh';
var phrase = process.env.PHRASE_KSOTD || 'hakunamatata';

var apiCall = function(path, method, signed, data, success, err) {
    let host = process.env.API || '127.0.0.1';
    let port = process.env.API_PORT || '10010';
    let headers = {'X-API-Key': signed};
    let dataString = JSON.stringify(data);
    if(method === 'GET' && data) {
        path += '?' + querystring.stringify(data);
    } else {
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
            'X-API-Key': signed
          };
    }
    let options = {
        host,
        port,
        path,
        method,
        headers
      };
      try {
            let req = http.request(options, function(res){
            
                res.setEncoding('utf-8');
                var responseString = '';

                res.on('data', function(data){
                    responseString += data;
                });

                res.on('end', function(){
                    let responseObject = JSON.parse(responseString);
                    success(responseObject);
                });         
            });
            req.on('error', err);
            req.write(dataString);
            req.end();
        } catch (error) {
            err(error);
        }
}

var shortcut = {
    message: 'Not yet'
}

var getShortcut = function(signed, res) {
    apiCall('/shortcuts/1', 'GET', signed, null, function (dataObject){
        shortcut = dataObject;
        res.render('index', { title: 'Keyboard shortcut of the day', dissa: icons.ticket, token: signed, 'shortcut' : JSON.stringify(shortcut), 'description': shortcut.description, stitle: shortcut.title, vendor: shortcut.vendor, product: shortcut.product, keys: shortcut.keycombo, documentation: shortcut.documentation });
    },
    function(error, req){
        res.render('error');
    }
    );
}

router.get('/', function (req, res) {
    var signed = jwt.sign({ phrase }, secret);
    getShortcut(signed, res);
})
  
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