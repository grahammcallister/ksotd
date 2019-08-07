var express = require('express');
var router = express.Router();
var mustacheExpress = require('mustache-express');
var humanize = require('humanizer');

router.get('/', function (req, res) {
    res.render('index', { title: 'Keyboard shortcut of the day', datetime: (new DateTime()).humanize });
})
  
var app = express();
app.use(express.static('public'));
app.engine('html', mustacheExpress());
app.set('views', 'views');
app.set('view engine', 'html');
app.use('/', router);

app.listen(process.env.PORT || 8080);