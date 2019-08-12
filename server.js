var express = require('express');
var router = express.Router();
var mustacheExpress = require('mustache-express');
var humanize = require('humanizer');
var icons = require('glyphicons');

router.get('/', function (req, res) {
    res.render('index', { title: 'Keyboard shortcut of the day', dissa: icons.ticket});
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