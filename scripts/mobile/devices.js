//NOTE: Run the audiences.js script to get audience data prior to running this script

const https = require("https");
const path = require("path");
const fs = require("fs");

const logs = {
    audiences: path.join(__dirname, "../../logs/mobile/audiences.txt"),
    attributes: path.join(__dirname, "../../logs/mobile/attributes.txt"),
    events: path.join(__dirname, "../../logs/mobile/events.txt")
};

const clear_file = (file_name) => {
    fs.writeFile(file_name, "", function() { 
        console.log(file_name + " file cleared.");
    }); 
};

Object.values(logs).forEach(log => {
    if (log.indexOf("audiences.txt") == -1) {
        clear_file(log);
    }
});

const audience_log = logs.audiences;
const attribute_log = logs.attributes;
const event_log = logs.events;

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
let success_count = 0;

fs.readFile(audience_log, "utf8", (err, data) => {
    if (err) throw err;
    let parsed_data = data.match(/\@(.*?)\@/g);
    parsed_data = parsed_data.slice(1, parsed_data.length);
    
    parsed_data.forEach(id => {
        const cleaned_id = id.substr(1, id.length-2);
        audience_ids.push(cleaned_id);
    });

    const get_data = (audience, index) => {
        const total_audiences = audience_ids.length;
        setTimeout(() => {
            console.log("Index is:", index);
            options.path = null;
            options.path = options_path + "/" + audience + "/devices";
            const req = https.get(options, (res) => {
            
                console.log(`Status Code: ${res.statusCode} ${res.statusMessage}`);
                if (res.statusCode == 429) {
                    console.log("Retrying!");
                    setTimeout(() => {
                        get_data(audience, index);
                    }, 5000);
                }
                else {
                    success_count++;
                    res.setEncoding("utf8");
                    let raw_data = "";
                    res.on("data", (chunk) => { raw_data += chunk; });
                    
                    res.on("end", () => {
                        const response = JSON.parse(raw_data);
                        console.log(`Success count: ${success_count}. Total audiences: ${total_audiences}`);

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
                        });

                        if (success_count == total_audiences) {
                            console.log("User attributes", attribute_obj);
                            console.log("User events", event_obj);
                            const all_attributes = Object.keys(attribute_obj);
                            const all_events = Object.keys(event_obj);

                            fs.appendFile(attribute_log, "Attribute Name@Attribute Count" + "\n", (err) => {
                                if (err) {
                                    console.log("Unable to append to file.");
                                }
                              });
                              
                            all_attributes.forEach(attr => {
                                fs.appendFile(attribute_log, attr + "@" + attribute_obj[attr] + "\n", (err) => {
                                    if (err) {
                                        console.log("Unable to append to file.");
                                    }
                                });
                            });

                            fs.appendFile(event_log, "Event Name@Event Count" + "\n", (err) => {
                                if (err) {
                                    console.log("Unable to append to file.");
                                }
                            });
                            
                            all_events.forEach(event => {
                                fs.appendFile(event_log, event + "@" + event_obj[event] + "\n", (err) => {
                                    if (err) {
                                        console.log("Unable to append to file.");
                                    }
                                });
                            });
                        }
                        else {
                            console.log(`${total_audiences - success_count} audiences left.`);
                        }

                    });
                }
            });     

            req.on("error", (e) => {
            console.error("Something went wrong: ", e);

            });
            
            req.end();
            console.log("Waiting " + (timer * (index + 1)) + " seconds.");
        }, 1000 * (index + 1));
    };
    
    const timer = 2000;
    audience_ids.forEach((audience, index) => {
        get_data(audience, index);
    });
});