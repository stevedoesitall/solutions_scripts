const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

const home = path.join(require("os").homedir(), "Desktop");
const file_path = home + "/import.csv";

const file = fs.readFileSync(file_path);

const encoded_file = home + "/new_import.csv";

sailthru.apiPost("job", {
    job: "import",
    list: "Import Test",
    file: encoded_file,
}, ["file"], function(err, response) {
    if (err) {
        console.log(err);
    } else {
        console.log("Running", response);
    }
});