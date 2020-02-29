//NOTE: Run the audiences.js script to get audience data prior to running this script

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

const audience_ids = [];

//Keep getting 429 errors; need to add better rate limiting
fs.readFile(audience_log, "utf8", (err, data) => {
    if (err) throw err;
    let parsed_data = data.match(/\@(.*?)\@/g);
    parsed_data = parsed_data.slice(1, parsed_data.length);
    
    parsed_data.forEach(id => {
        const cleaned_id = id.substr(1, id.length-2);
        audience_ids.push(cleaned_id);
    });
    
    const timer = 2000;
    audience_ids.forEach((audience, index) => {
        setTimeout(() => {
            console.log("Index is:", index);
            options.path = null;
            options.path = options_path + "/" + audience + "/devices";
            const req = https.get(options, (res) => {
            
                console.log(`Status Code: ${res.statusCode} ${res.statusMessage}`);
                if (res.statusCode == 429) {
                    console.log("Terminating!");
                    return false;
                }

                res.setEncoding("utf8");
                let raw_data = "";
                res.on("data", (chunk) => { raw_data += chunk; });
                
                res.on("end", () => {
                    const response = JSON.parse(raw_data);
                    response.devices.forEach((device) => {
                        
                        const user_attributes = Object.keys(device.user_attributes);
                        const user_events = Object.keys(device.user_events);

                        user_attributes.forEach(attribute => {
                            if (attribute_obj[attribute]) {
                                attribute_obj[attribute]++;
                            }
                            else {
                                attribute_obj[attribute] = 1;
                            }
                        });

                        user_events.forEach(event => {
                            if (event_obj[event]) {
                                event_obj[event]++;
                            }
                            else {
                                event_obj[event] = 1;
                            }
                        });
                        // if (index == (response.devices.length - 1)) {
                        //     console.log("User attributes", attribute_obj);
                        //     console.log("User events", event_obj);
                        // }
                    });
                });
            });     

            req.on("error", (e) => {
            console.error("Something went wrong: ", e);

            });
            
            req.end();
            console.log("Waiting " + (timer * (index + 1)) + " seconds.");
        }, 1000 * (index + 1));
    });
});

