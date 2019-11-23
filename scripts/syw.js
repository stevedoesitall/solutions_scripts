const creds = require("./ignore/creds.json");
const api_key = creds.api_key;
const api_secret = creds.api_secret;
const sailthru = require('sailthru-client').createSailthruClient(api_key, api_secret);

const zips = ["10025 US", "10026 US", "10027 US", "10028 US"];
const all_criteria = [];
const criteria_val = "geo_radius";
const all_radiuses = [];
const radius_val = 5;

zips.forEach(zip => {
    all_criteria.push(criteria_val);
    all_radiuses.push(radius_val);
});

sailthru.apiPost("list", {
    list: "Zip Test List",
    type: "smart",
    query: {
        source_list: "Master List",
        criteria: all_criteria,
        radius: all_radiuses,
        value: zips,
        query_mode: "or"
    }
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(response);
    }
});
