var express = require('express'),
    bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var performanceRouter = require('./routers/performanceRouter')();

app.use('/api/performance', performanceRouter);

app.listen(port, function () {
    console.log('Running')
});