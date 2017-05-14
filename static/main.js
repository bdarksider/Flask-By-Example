(function() {
    'use strict';

    angular.module('WordcountApp', [])

    .controller('WordcountController', ['$scope', '$log', '$http', '$timeout',
        function($scope, $log, $http, $timeout) {
            $scope.submitButtonText = 'Submit';
            $scope.loading = false;
            $scope.urlerror = false;
            $scope.getResults = function() {
                // get the URL from the input
                var userInput = $scope.url;

                // fire the API request
                $http.post('/start', { "url": userInput }).
                then(function(results) {
                        $log.log(results);
                        getWordCount(results.data);
                        $scope.wordcounts = null;
                        $scope.loading = true;
                        $scope.submitButtonText = 'Loading...';
                        $scope.urlerror = false;
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
                            $scope.loading = false;
                            $scope.submitButtonText = "Submit";
                            $scope.wordcounts = result.data;
                            $timeout.cancel(timeout);
                            return false;
                        }
                        // continue to call the poller() function every 2 seconds
                        // until the timeout is cancelled
                        timeout = $timeout(poller, 2000);
                    },
                    function(error) {
                        $log.log(error);
                        $scope.loading = false;
                        $scope.submitButtonText = "Submit";
                        $scope.urlerror = true;
                    });
                };
                poller();
            }
        }
    ]);
}());
