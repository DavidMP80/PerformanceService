let express = require('express'),
    ping = require('ping');

let mongoose = require('mongoose');
let ResponseModel = require('../models/response_model');
mongoose.connect('mongodb://localhost/responses');

let redis = require('redis');
// var client = redis.createClient(6379, '127.0.0.1');
let redisClient = redis.createClient();

redisClient.on('connect', function() {
    console.log('connected');
});

function getCurrentTimestamp(){
    return Math.floor(Date.now());
}

let routes = function() {

    let performanceRouter = express.Router();

    function doPing(responseModel, callback) {
        // store current timestamp in Redis
        redisClient.get(responseModel.url, function(error, requestTimestamp){
            if (error) {
                throw error;
            }

            if (!requestTimestamp){
                redisClient.setex(responseModel.url,  10, getCurrentTimestamp())
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
                    redisClient.get(responseModel.url, function(error, requestTimestamp){
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
                                redisClient.del(responseModel.url);
                            }
                        }
                    });
                })
        }
    }

    /* Send response */
    performanceRouter.route('/')
        .post(function (req, res) {
            // Create response model from POST
            let responseModel = new ResponseModel();
            responseModel.id = req.body.id;
            responseModel.name = req.body.name;
            responseModel.url = req.body.url;
            responseModel.repetitions = req.body.repetitions;
            responseModel.times = [];

            // Ping hosts
            doPing(responseModel, function (response) {

                // Add host response times in the response model
                responseModel.times= response.times;

                // Save the response model to MongoDB
                let promise = responseModel.save();
                promise.then(function (response) {
                    // Send back results
                    res.send(response.times);
                });
            });
        })
        .get(function (req, res) {
            res.send('retorn');
        });

    /* Get all responses */
    performanceRouter.get('/responses', function (req, res) {
        ResponseModel.find(function(err, responses) {
            if (err) {
                res.json({info: 'error during find responses', error: err});
            }
            setTimeout(function(){
                res.json({info: 'responses found successfully', data: responses});
            }, 10000);
        });
    });

    /* Get response by id */
    performanceRouter.get('/responses/:id', function (req, res) {
        ResponseModel.findById(req.params.id, function(err, response) {
            if (err) {
                res.json({info: 'error during find response', error: err});
            }
            if (response) {
                res.json({info: 'response found successfully', data: response});
            } else {
                res.json({info: 'response not found'});
            }
        });
    });

    /* Delete response by id*/
    performanceRouter.delete('/responses/:id', function (req, res) {
        ResponseModel.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.json({info: 'error during remove response', error: err});
            }
            res.json({info: 'response removed successfully'});
        });
    });

    return performanceRouter;
};

module.exports = routes;