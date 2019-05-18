const sort_by = require('./sort');
const format_for_display = require('./format');


async function run_tests() {

    var criteria = ['ALUMNIS_PERCENTAGE', 'AUTOMATION_RISK', 'GROWTH_BY_2024'];
    //var criteria = ['GROWTH_BY_2024'];
    //var criteria = ['ALUMNIS_PERCENTAGE'];
    //var criteria = ['MEDIAN_WAGE'];
    var sorted_data = await sort_by(criteria);

    //console.log("Sorted data [0] :");
    //console.log(sorted_data[0]);

    formatted = format_for_display(criteria, sorted_data, 5);
    console.log(formatted);
}

run_tests();
