const https = require("https");
const path = require("path");
const fs = require("fs");

const log = path.join(__dirname, "../../logs/mobile/audiences.txt");

fs.writeFile(log, "", function() { 
  console.log("Audiences file cleared.");
});

const creds = path.join(__dirname, "../../ignore/creds.js");
const api_key = require(creds).mobile_api_key;

const authorization = "Basic " + Buffer.from(api_key, "utf8").toString("base64");
const endpoint = "audiences";

const options = {
  hostname: "api.carnivalmobile.com",
  path: "/v6/" + endpoint,
  port: null,
  headers: {
    authorization,
    accept : "application/json"
  } 
};

const req = https.get(options, (res) => {

  //Get the initial list of audiences

  console.log("Status Code:", res.statusCode);

  res.setEncoding("utf8");
  let raw_data = "";
  res.on("data", (chunk) => { raw_data += chunk; });
  
  res.on("end", () => {

    //Get the audience-specific data
    const response = JSON.parse(raw_data);
    const all_audiences = response.audiences;
    const audience_obj = {};

    let run_count = 0;

    all_audiences.forEach(audience => {
      console.log("Getting stats for", audience.id);

      options.path = null;
      options.path = "/v6/" + endpoint + "/" + audience.id;

      const req = https.get(options, (res) => {

        console.log("Status Code:", res.statusCode);
      
        res.setEncoding("utf8");
        let raw_data = "";
        res.on("data", (chunk) => { raw_data += chunk; });
        
        res.on("end", () => {
          const response = JSON.parse(raw_data);
          const audience_data = response.audience;
          
          if (audience_data.name.substring(0,13) != "api_audience_") {
            audience_obj[audience_data.name] = {};
            audience_obj[audience_data.name].id = audience_data.id;
            audience_obj[audience_data.name].device_count = audience_data.device_count;
          }

          run_count++;
          if (run_count == all_audiences.length) {
            save_data(audience_obj);
          }
        });
      });
      
      req.on("error", (e) => {
        console.error("Something went wrong (GET 2): ", e);
      });
      req.end();
    });
  });
});

const save_data = (audience_obj) => {
  console.log("Saving data...");
  fs.appendFile(log, "Audience Name@Audience ID@Audience Count" + "\n", (err) => {
    if (err) {
        console.log("Unable to append to file.");
    }
  });
  const audience_names = Object.keys(audience_obj);
  
  audience_names.forEach(audience => {
    fs.appendFile(log, audience + "@" + audience_obj[audience].id + "@" + audience_obj[audience].device_count + "\n", (err) => {
      if (err) {
          console.log("Unable to append to file.");
      }
    });
  });
};

req.on("error", (e) => {
  console.error("Something went wrong (GET 1): ", e);
});

req.end();