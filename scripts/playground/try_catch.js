const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

sailthru.apiGet("user", {
    id: "sgiordanosailthru.com"
}, function(error, response) {
    try {
        console.log(response);
    } catch (error) {
        console.log(error);
    }
});