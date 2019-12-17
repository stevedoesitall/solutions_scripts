const path = require("path");
const creds = path.join(__dirname, "../../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const dates = [7, 14, 21, 28, 35, 42, 49, 60, 100];

const list_options = {
    type: "smart",
    query: {}
};

list_options.query = {
    source_list:  ".primary",
    criteria: [],
    timerange: [],
    field: [],
    query_mode: "or",
    value: []
};

/*List query fields:
-Criteria: var_date
-Timerange: on_date
-Field: due_date
*/

//Create individual lists for one-off sends
dates.forEach(date => {
    //Vars for query creation
    const new_options = list_options;
    const query = list_options.query;
    const value = date + " days midnight";
    const list = "Pregnancy Smart List - " + date + " Days Away"

    new_options.list = list;

    //Push criteria, timeranges, fields, and values in query object
    query.criteria = [];
    query.timerange = [];
    query.field = [];
    query.value = [];

    query.criteria.push("var_date");
    query.timerange.push("on_date");
    query.field.push("due_date");
    query.value.push(value);

    sailthru.apiPost("list", new_options, 
    function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(response);
        }
    });
});

//Create Master List
dates.forEach(date => {
    //Vars for query creation
    const query = list_options.query;
    const value = date + " days midnight";

    //Push criteria, timeranges, fields, and values in query object
    query.criteria.push("var_date");
    query.timerange.push("on_date");
    query.field.push("due_date");
    query.value.push(value);
});

list_options.list = "Pregnancy Smart List";
list_options.primary = 1;

sailthru.apiPost("list", list_options, 
    function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(response);
        }
    }
);
