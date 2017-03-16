
let ping = require('ping'),
    redis = require('redis');

var PerformanceController = class{

    constructor(redisClient){
        this.redisClient = redisClient;
    }

    getCurrentTimestamp(){
        return Math.floor(Date.now());
    }

    doPing(responseModel, callback) {

        let self = this;

        // store current timestamp in Redis
        this.redisClient.get(responseModel.url, function(error, requestTimestamp){
            if (error) {
                throw error;
            }

            if (!requestTimestamp){
                self.redisClient.setex(responseModel.url,  10, self.getCurrentTimestamp())
            }
        });

        let host = responseModel.url;
        let reps = responseModel.repetitions;

        for (let i = 0; i < reps; i++) {
         
            ping.promise.probe(host)
            .then(function () {
                // Save current timestamp in response responseTimestamp variable
                let responseTimestamp = self.getCurrentTimestamp();

                // Get request timestamp using Redis
                self.redisClient.get(responseModel.url, function(error, requestTimestamp){
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

                        console.log('doPing 2: ' + responseModel.times.length);

                        if (responseModel.times.length == reps) {

                            callback(responseModel);
                            self.redisClient.del(responseModel.url);
                        }
                    }
                });
            })
        }
    }
}

module.exports = PerformanceController;