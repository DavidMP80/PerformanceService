
'use strict'

var chai = require('chai'),
    expect = chai.expect;

let performanceController = require('../../controllers/performanceController.js'),
    responseModel = require('../../models/response_model');

let redis = require('redis');
let redisClient = redis.createClient();

let controller = new performanceController(redisClient);

chai.should();

describe('getCurrentTimestamp', function(){
    it('should return a valid time stamp', function(){

        var currentTimeStamp = controller.getCurrentTimestamp();        
        expect(currentTimeStamp).to.be.ok;
    })
})

// The next test is not working as expected, because the ping method is assync, and the callback is not being raised
describe('doPing', function(){
    it('should be', function (){

        var model = new responseModel();
        model.name = 'Google';
        model.url = 'www.google.com';
        model.repetitions = '5';

        controller.doPing(model, function(response){            
            expect(reponse.times.length).to.equal(5);
        });
    })
})