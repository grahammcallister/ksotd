var express = require('express');
var router = express.Router();
var mustacheExpress = require('mustache-express');
var humanize = require('humanizer');

router.get('/', function (req, res) {
    res.render('index', { title: 'Keyboard shortcut of the day', datetime: (new Date())});
})
  
var app = express();
app.use(express.static('public'));
app.engine('html', mustacheExpress());
app.set('views', 'views');
app.set('view engine', 'html');
app.use('/js', [express.static(__dirname + '/node_modules/jquery/dist/'),
                express.static(__dirname + '/node_modules/bootstrap/dist/js/')]);
app.use('/css', [express.static(__dirname + '/node_modules/bootstrap/dist/css/'),
                express.static(__dirname + '/node_modules/font-awesome/css/')]); 
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts/'));
app.use('/', router);

app.listen(process.env.PORT || 8080);