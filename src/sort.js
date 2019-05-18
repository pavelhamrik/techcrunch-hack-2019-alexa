
var Sort = (function() {
    'use strict';

    var __data = [];
    const __sortable_columns = ['ALUMNIS_PERCENTAGE', 'AUTOMATION_RISK', 'GROWTH_BY_2024', 'MEDIAN_WAGE', 'PEOPLE_EMPLOYED', 'FUN', 'TEAM_WORK'];

    async function __load_data(filename) {
        return new Promise(function(resolve, reject) {
            var fs = require('fs');
            var csv = require('fast-csv');

            var headers = [];

            var ordinalNumber = 0;

            fs.createReadStream(filename)
                .pipe(csv())
                .on('data', function(item) {
                    if (headers.length === 0) {
                        headers = item;
                    } else {
                        var row = {};
                        for (var i=0; i<headers.length; i++) {
                            row[headers[i]] = item[i];
                        }
                        ordinalNumber += 1;
                        row['ordinalNumber'] = ordinalNumber;
                        __data.push(row);
                    }
                })
                .on('end', function(_nil) {
                    __stats = __update_stats(__data);
                    resolve();
                });
        });
    }

    function __get_number(value) {
        return parseInt(value.replace(/[^0-9\-]/g, ''), 10);
    }

    function __update_stats(data) {
        var stats = {};
        data.forEach(function(row) {
            __sortable_columns.forEach(function(column) {
                // console.log(column);
                var value = row[column];
                value = __get_number(value);
                if (!(column in stats)) {
                    stats[column] = { 'min': 9999999, 'max': -9999999 };
                }
                var min = stats[column]['min'];
                var max = stats[column]['max'];
                if (value < min) {
                    stats[column]['min'] = value;
                }
                if (value > max) {
                    stats[column]['max'] = value;
                }
            });
        });
        return stats;
    }

    var __stats;

    function __normalize(column, value) {
        var min = __stats[column]['min'];
        var max = __stats[column]['max'];
        var sign = 1;
        if (column == "AUTOMATION_RISK") {
            sign = -1;
        }
        var normalized_value = sign*(value - min)/(max-min);
        //console.log("Normalized " + column + " score is " + normalized_value + " for " + value);
        return normalized_value;
    }

    function __score(row, criteria) {
        var score = 0;
        criteria.forEach(function(column) {
            score += __normalize(column, __get_number(row[column]));
        }, this);
        //console.log("Score for row " + row['FUNCTION'] + " is: " + score);
        return score;
    }

    return {
        init: async function() {
            await __load_data('../data.csv', );
        },
        sort_by: function(criteria) {
            return __data.slice().sort(function(a, b) {
                var score_a = __score(a, criteria);
                var score_b = __score(b, criteria);
                return score_b - score_a;
            }, this);
        }
    };
}());

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    await Sort.init();

    var criteria = ['ALUMNIS_PERCENTAGE', 'AUTOMATION_RISK', 'GROWTH_BY_2024'];
    //var criteria = ['GROWTH_BY_2024'];
    //var criteria = ['ALUMNIS_PERCENTAGE'];
    //var criteria = ['MEDIAN_WAGE'];
    sorted_data = Sort.sort_by(criteria);

    // console.log("Sorted data [0] :", sorted_data[0]);
    
    return sorted_data;
}

module.exports = run;

// run();
