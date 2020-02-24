const https = require("https");
const path = require("path");
const fs = require("fs");

const audience_log = path.join(__dirname, "../../logs/mobile/audiences.txt");
const device_log = path.join(__dirname, "../../logs/mobile/devices.txt");

const creds = path.join(__dirname, "../../ignore/creds.js");
const api_key = require(creds).mobile_api_key;

const authorization = "Basic " + Buffer.from(api_key, "utf8").toString("base64");
const endpoint = "audiences";
const options_path = "/v6/" + endpoint;

const options = {
    hostname: "api.carnivalmobile.com",
    path: options_path,
    port: null,
    headers: {
        authorization,
        accept : "application/json"
    } 
};

const attribute_obj = {};
const event_obj = {};

let audience_ids = [];

//Keep getting 429 errors; need to add better rate limiting
fs.readFile(audience_log, "utf8", (err, data) => {
    if (err) throw err;
    let parsed_data = data.match(/\@(.*?)\@/g);
    parsed_data = parsed_data.slice(1, parsed_data.length);
    
    parsed_data.forEach(id => {
        const cleaned_id = id.substr(1, id.length-2);
        audience_ids.push(cleaned_id);
    });
    
    audience_ids.forEach(audience => {
        options.path = null;
        options.path = options_path + "/" + audience + "/devices";

            setTimeout(function() {
            const req = https.get(options, (res) => {
            
                console.log(`Status Code: ${res.statusCode} ${res.statusMessage}`);

                res.setEncoding("utf8");
                let raw_data = "";
                res.on("data", (chunk) => { raw_data += chunk; });
                
                res.on("end", () => {
                    const response = JSON.parse(raw_data);
                    response.devices.forEach(device => {
                        console.log("Device Attributes", device.user_attributes);
                        console.log("Event Attributes", device.user_events);
                    });
                });
            });            
            req.on("error", (e) => {
            console.error("Something went wrong: ", e);
        });
        req.end();
        
    }, 1000);

    });
});

