const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const log = path.join(__dirname, "../../logs/email/lo.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

sailthru.apiGet("lifecycle", {
    "id" : "3951e372-d9e5-479c-8501-e265b8488b5d"
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(response.steps['085d6ebf-b81a-4983-bd18-4b0812e8ab9f'].children);
    }
});