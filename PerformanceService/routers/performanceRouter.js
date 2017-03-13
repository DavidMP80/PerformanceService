let express = require('express'),
    ping = require('ping');

let redis = require('redis');
// var client = redis.createClient(6379, '127.0.0.1');
let client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});

function getCurrentTimestamp(){
    return Math.floor(Date.now());
}

let routes = function() {

    let performanceRouter = express.Router();

    function doPing(responseModel, callback) {
        // store current timestamp in Redis
        client.get(responseModel.url, function(error, requestTimestamp){
            if (error) {
                throw error;
            }

            if (!requestTimestamp){
                client.setex(responseModel.url,  10, getCurrentTimestamp())
            }
        });

        let host = responseModel.url;
        let reps = responseModel.repetitions;
        
        for (let i = 0; i < reps; i++) {
            ping.promise.probe(host)
                .then(function () {
                    // Save current timestamp in response responseTimestamp variable
                    let responseTimestamp = getCurrentTimestamp();

                    // Get request timestamp using Redis
                    client.get(responseModel.url, function(error, requestTimestamp){
                        if (error) {
                            throw error;
                        }

                        if (requestTimestamp){
                            // Parse request timestamp
                            let requestTimestampInt = Number(requestTimestamp);

                            // Calculate response time
                            let result = responseTimestamp - requestTimestampInt;

                            // Push ping response time in response
                            responseModel.times.push(result);

                            if (responseModel.times.length == reps) {
                                callback(responseModel);
                                client.del(responseModel.url);
                            }
                        }
                    });
                })
        }
    }

    performanceRouter.route('/')
        .post(function (req, res) {

            let responseModel = {
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