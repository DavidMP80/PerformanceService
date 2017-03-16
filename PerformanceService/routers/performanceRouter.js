let express = require('express'),
    ping = require('ping');

let mongoose = require('mongoose');
let ResponseModel = require('../models/response_model');
mongoose.connect('mongodb://localhost/responses');

let controller = require('../controllers/performanceController');

let redis = require('redis');
// let client = redis.createClient(6379, '127.0.0.1');
let redisClient = redis.createClient();

redisClient.on('connect', function() {
    console.log('connected');
});

let routes = function() {

    let performanceRouter = express.Router();
    controller = new controller(redisClient);

    /* Send response */
    performanceRouter.route('/')
        .post(function (req, res) {
            // Create response model from POST
            let responseModel = new ResponseModel();
            responseModel.id = req.body.id;
            responseModel.name = req.body.name;
            responseModel.url = req.body.url;
            responseModel.repetitions = req.body.repetition;
            responseModel.times = [];

            controller.doPing(responseModel, function (response) {
                // Add host response times in the response model
                responseModel.times= response.times;

                // Save the response model to MongoDB
                let promise = responseModel.save();

                promise.then(function (response) {
                    // Send back results
                    res.json(response);
                });
            });

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

// Exports getCurrentTimestamp for unit testing purposes
module.exports = routes;