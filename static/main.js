(function() {
    'use strict';

    angular.module('WordcountApp', [])

    .controller('WordcountController', ['$scope', '$log', '$http', '$timeout',
        function($scope, $log, $http, $timeout) {
            $scope.getResults = function() {
                // get the URL from the input
                var userInput = $scope.url;

                // fire the API request
                $http.post('/start', { "url": userInput }).
                then(function(results) {
                        $log.log(results);
                        getWordCount(results.data);
                    },
                    function(error) {
                        $log.log(error);
                    });
            };

            function getWordCount(jobId) {

                var timeout = "";

                var poller = function() {
                    // fire another request
                    $http.get('/results/' + jobId).
                    then(function(result) {
                        if (result.status === 202) {
                            $log.log(result.data, result.status);
                        } else if (result.status === 200) {
                            $log.log(result.data);
                            $scope.wordcounts = result.data;
                            $timeout.cancel(timeout);
                            return false;
                        }
                        // continue to call the poller() function every 2 seconds
                        // until the timeout is cancelled
                        timeout = $timeout(poller, 2000);
                    });
                };
                poller();
            }
        }
    ]);
}());
