const path = require("path");
const creds = path.join(__dirname, "../../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const dates = [7, 14, 21, 28, 35, 42, 49];

const list = "Pregnancy Smart List";

/*List Query:
-Criteria: var_date
-Timerange: on_date
-Field: due_date
*/

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

dates.forEach(date => {
    const value = date + " days midnight";
    list_options.query.criteria.push("var_date");
    list_options.query.timerange.push("on_date");
    list_options.query.field.push("due_date");
    list_options.query.value.push(value);
});

console.log(list_options);

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
