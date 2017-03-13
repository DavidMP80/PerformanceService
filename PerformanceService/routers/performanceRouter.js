var express = require('express'),
    ping = require('ping');

var routes = function() {

    var performanceRouter = express.Router();

    function doPing(responseModel, callback) {

        var host = responseModel.url;
        var reps = responseModel.repetitions;
        
        for (var i = 0; i < reps; i++) {
            
            ping.promise.probe(host)
                .then(function (res) {

                    responseModel.times.push(res.time);
                    
                    if (responseModel.times.length == reps) {
                        callback(responseModel);
                    }
                })
        };        
    }

    performanceRouter.route('/')
        .post(function (req, res) {
            
            var responseModel = {
                url: req.body.url,
                repetitions: req.body.repetition,
                times: []
            };
            
            doPing(responseModel, function (response) {
                
                res.send(response.times);                

            });            
        })
        .get(function (req, res) {
            res.send('retorn');
        });

    return performanceRouter;
};

module.exports = routes;