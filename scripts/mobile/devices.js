// const https = require("https");
// const path = require("path");
// const fs = require("fs");

// const audience_id = "5e852f2fca763800016f9951";

// const logs = {
//     attributes: path.join(__dirname, "../../logs/mobile/attributes.txt"),
//     events: path.join(__dirname, "../../logs/mobile/events.txt")
// };

// const clear_file = (file_name) => {
//     fs.writeFile(file_name, "", function() { 
//         console.log(file_name + " file cleared.");
//     }); 
// };

// for (const log in logs) {
//     clear_file(logs[log]);
// }

// const attribute_log = logs.attributes;
// const event_log = logs.events;

// const creds = path.join(__dirname, "../../ignore/creds.js");
// const api_key = require(creds).mobile_api_key;

const api_key = "3c393bb5ac4d17b6b6352811d2dca827a1455307"

const authorization = "Basic " + Buffer.from(api_key, "utf8").toString("base64")
// const endpoint = "audiences";
// const options_path = "/v6/" + endpoint + "/" + audience_id + "/devices?cursor=";

console.log(authorization)

// let cursor = null;

// const options = {
//     hostname: "api.carnivalmobile.com",
//     path: options_path + cursor,
//     port: null,
//     headers: {
//         authorization,
//         accept : "application/json"
//     } 
// };

// const attribute_obj = {};
// const event_obj = {};

// const cursors_obj = {};

// const get_data = (audience, options, cursor) => {
//     const req = https.get(options, (res) => {
    
//         console.log(`Status Code: ${res.statusCode} ${res.statusMessage}`);

//         res.setEncoding("utf8");
//         let raw_data = "";
//         res.on("data", (chunk) => { raw_data += chunk; });
        
//         res.on("end", () => {
//             const new_options = options;
//             const response = JSON.parse(raw_data);
//             const total_devices = response.meta.total;

//             const new_cursor = response.meta.cursor;
//             console.log("New cursor is", new_cursor);

//             if (cursor) {
//                 if (cursors_obj[cursor]) {
//                     cursors_obj[cursor]++;
//                 } else {
//                     cursors_obj[cursor] = 1;
//                 }
//             }

//             if (cursors_obj[cursor] === 5 || !cursor) {
//                 cursor = new_cursor;
//                 new_options.path = options_path + cursor;
//             }

//             console.log("Using cursor 1:", cursor);

//             let remaining_devices = total_devices;

//             const response_length = response.devices.length;
//             remaining_devices = remaining_devices - response_length;

//             response.devices.forEach((device) => {
//                 const user_attributes = Object.keys(device.user_attributes);
//                 const user_events = Object.keys(device.user_events);

//                 user_attributes.forEach(attribute => {
//                     if (attribute_obj[attribute]) {
//                         attribute_obj[attribute]++;
//                     }
//                     else {
//                         attribute_obj[attribute] = 1;
//                     }
//                 });

//                 user_events.forEach(event => {
//                     if (event_obj[event]) {
//                         event_obj[event]++;
//                     }
//                     else {
//                         event_obj[event] = 1;
//                     }
//                 });
//             });

//             console.log("User attributes", attribute_obj);
//             console.log("User events", event_obj);
//             const all_attributes = Object.keys(attribute_obj);
//             const all_events = Object.keys(event_obj);

//             // fs.appendFile(attribute_log, "Attribute Name@Attribute Count" + "\n", (err) => {
//             //     if (err) {
//             //         console.log("Unable to append to file.");
//             //     }
//             //     });
                
//             // all_attributes.forEach(attr => {
//             //     fs.appendFile(attribute_log, attr + "@" + attribute_obj[attr] + "\n", (err) => {
//             //         if (err) {
//             //             console.log("Unable to append to file.");
//             //         }
//             //     });
//             // });

//             // fs.appendFile(event_log, "Event Name@Event Count" + "\n", (err) => {
//             //     if (err) {
//             //         console.log("Unable to append to file.");
//             //     }
//             // });
            
//             // all_events.forEach(event => {
//             //     fs.appendFile(event_log, event + "@" + event_obj[event] + "\n", (err) => {
//             //         if (err) {
//             //             console.log("Unable to append to file.");
//             //         }
//             //     });
//             // });

//             if (remaining_devices > 0) {
//                 get_data(audience, options, cursor);
//                 console.log("Using cursor 2:", cursor);
//             }
//         });
//     });     

//     req.on("error", (e) => {
//     console.error("Something went wrong: ", e);

//     });
    
//     req.end();
// };

// get_data(audience_id, options);