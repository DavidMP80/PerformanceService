var express = require('express'),
    bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3001;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var performanceRouter = require('./routers/performanceRouter')();
app.use('/api/performance', performanceRouter);

app.listen(port, function () {
    console.log('Running')
});