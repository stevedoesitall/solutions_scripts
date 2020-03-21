const path = require("path");
const creds = path.join(__dirname, "../../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const job_params = {
    job: "export_list_data",
    list: "Just Me"
};

sailthru.apiPost("job", job_params, 
    function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(response);
        }
    }
);