const path = require("path");
const creds = path.join(__dirname, "../../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const dates = [7, 14, 21, 28, 35, 42, 49];

const list = "Pregnancy Smart List";

const list_options = {
    list: list,
    primary: 1,
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

dates.forEach(date => {
    //Vars for query creation
    const query = list_options.query;
    const value = date + " days midnight";

    //Push criteria, timeranges, fields, and values in query object
    query.criteria.push("var_date");ß
    query.timerange.push("on_date");
    query.field.push("due_date");
    query.value.push(value);
});

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
