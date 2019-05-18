
var Format = (function() {
    'use strict';

    function __formatted_items(sorting_criteria, sorted_data, number_of_items) {
        if (Array.isArray(sorting_criteria)) {
            var criteria = sorting_criteria[0];
        } else {
            var criteria = sorting_criteria;
        }
        var formatted = [];
        for (var i=0; i<number_of_items; i++) {
            var raw_item = sorted_data[i];
            //console.log(raw_item);
            var item = {
                        "listItemIdentifier": raw_item['id'],
                        "ordinalNumber": i+1,
                        "textContent": {
                            "primaryText": {
                                "type": "PlainText",
                                "text": raw_item['FUNCTION']
                            },
                            "secondaryText": {
                                "type": "RichText",
                                "text": raw_item[criteria]
                            },
                        },
                        "token": raw_item['FUNCTION'] 
                    }
            formatted.push(item);
        }
        return formatted;
    }

    function __formatted_alumni_items(alumni, number_of_items) {
        var formatted = [];
        for (var i=0; i<number_of_items; i++) {
            var raw_item = JSON.parse(alumni[i]);
            var item = {
                        "listItemIdentifier": raw_item['name'],
                        "ordinalNumber": i+1,
                        "textContent": {
                            "primaryText": {
                                "type": "PlainText",
                                "text": raw_item['name']
                            },
                            "secondaryText": {
                                "type": "RichText",
                                "text": raw_item['title']
                            },
                        },
                        "token": raw_item['name'] 
                    }
            formatted.push(item);
        }
        return formatted;
    }

    function __toTitleCase(str) {
        str = str.toLowerCase().replace('_', ' ').split(' ');
        for (var i=0; i<str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    };

    function __format_criteria_for_display(criteria) {
        return __toTitleCase(criteria);
    }

    function __format_for_display(sorting_criteria, sorted_data, number_of_items) {
        if (Array.isArray(sorting_criteria)) {
            var criteria = sorting_criteria[0];
        } else {
            var criteria = sorting_criteria;
        }
        criteria = __format_criteria_for_display(criteria);
        var items = __formatted_items(sorting_criteria, sorted_data, number_of_items);
        var data_json = {
            "listTemplate1Metadata": {
                "type": "object",
                "objectId": "lt1Metadata",
                "backgroundImage": {
                    "contentDescription": null,
                    "smallSourceUrl": null,
                    "largeSourceUrl": null,
                    "sources": [
                        {
                            "url": "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                            "size": "small",
                            "widthPixels": 0,
                            "heightPixels": 0
                        },
                        {
                            "url": "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                            "size": "large",
                            "widthPixels": 0,
                            "heightPixels": 0
                        }
                    ]
                },
                "title": "Popular EDHEC carriers sorted by " + criteria + ": ",
                "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
            },
            "listTemplate1ListData": {
                "type": "list",
                "listId": "lt1Sample",
                "totalNumberOfItems": number_of_items,
                "listPage": {
                    "listItems": items
                }
            }
        };
        return data_json;
    }

    function __format_for_display_alumni(data, number_of_items) {
        var alumni = [];
        for (var i=0; i<number_of_items; i++) {
            var alum = data['ALMUNI_' + (i+1)];
            alumni.push(alum);
        }
        //console.log(alumni);
        var items = __formatted_alumni_items(alumni, number_of_items);
        var data_json = {
            "listTemplate1Metadata": {
                "type": "object",
                "objectId": "lt1Metadata",
                "backgroundImage": {
                    "contentDescription": null,
                    "smallSourceUrl": null,
                    "largeSourceUrl": null,
                    "sources": [
                        {
                            "url": "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                            "size": "small",
                            "widthPixels": 0,
                            "heightPixels": 0
                        },
                        {
                            "url": "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                            "size": "large",
                            "widthPixels": 0,
                            "heightPixels": 0
                        }
                    ]
                },
                "title": "EDHEC Alumni experienced with this role are: ",
                "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
            },
            "listTemplate1ListData": {
                "type": "list",
                "listId": "lt1Sample",
                "totalNumberOfItems": number_of_items,
                "listPage": {
                    "listItems": items
                }
            }
        };
        return data_json;
    }

    return {
        format_for_display: function(sorting_criteria, sorted_data, number_of_items) {
            return __format_for_display(sorting_criteria, sorted_data, number_of_items)
        },
        format_for_display_alumni: function(data, number_of_items) {
            return __format_for_display_alumni(data, number_of_items)
        }
    };
}());

function format_for_display(screen='jobs', data, sorting_criteria, number_of_items) {
    if (screen == 'jobs') {
        var sorted_data = data;
        return Format.format_for_display(sorting_criteria, sorted_data, number_of_items);
    } else {
        return Format.format_for_display_alumni(data, number_of_items);
    }
}

module.exports = format_for_display;
