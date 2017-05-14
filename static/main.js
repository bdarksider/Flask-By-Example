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
    ])
    .directive('wordCountChart', ['$parse', function($parse) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div id="chart"></div>',
            link: function (scope) {
                scope.$watch('wordcounts', function() {
                    d3.select('#chart').selectAll('*').remove();
                    var data = {};
                    for (var i = 0; i < scope.wordcounts.length; i++) {
                        data[scope.wordcounts[i][0]] = scope.wordcounts[i][1];
                    }
                    for (var word in data) {
                        d3.select('#chart')
                            .append('div')
                            .selectAll('div')
                            .data(word[0])
                            .enter()
                            .append('div')
                            .style('width', function() {
                                return (data[word] * 20) + 'px';
                            })
                            .text(function(d) {
                                return word;
                            });
                    }
                }, true);
            }
        };
    }])
}());
