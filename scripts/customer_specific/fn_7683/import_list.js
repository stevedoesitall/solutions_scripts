const path = require("path");
const creds = path.join(__dirname, "../../../ignore/creds.js");
const home = path.join(require("os").homedir(), "Desktop");
const file_path = home + "/aov_import.csv";

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

console.log(file_path);

const job_params = {
    job: "import",
    list: "Just Me",
    file: file_path
};

sailthru.apiPost("job", job_params, ["file"],
    function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(response);
        }
    }
);