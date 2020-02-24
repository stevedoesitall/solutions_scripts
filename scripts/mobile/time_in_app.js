const https = require("https");
const path = require("path");

const creds = path.join(__dirname, "../../ignore/creds.js");
const api_key = require(creds).mobile_api_key;

const start_date = require("../modules/dates.js").start_date;
const end_date = require("../modules/dates.js").end_date;

const authorization = "Basic " + Buffer.from(api_key, "utf8").toString("base64");
const endpoint = "sessions";

const query = "?from=" + start_date + "&to=" + end_date;

const options = {
  hostname: "api.carnivalmobile.com",
  path: "/v6/stats/" + endpoint + query,
  port: null,
  headers: {
    authorization,
    accept : "application/json"
  } 
};

const req = https.get(options, (res) => {
  console.log(`Getting data from ${start_date} to ${end_date}`);
  
  let total_sessions = 0;
  console.log("Status Code:", res.statusCode);

  res.setEncoding("utf8");
  let raw_data = "";
  res.on("data", (chunk) => { raw_data += chunk; });
  
  res.on("end", () => {
    const response = JSON.parse(raw_data)
    response.forEach(day => {
      total_sessions = total_sessions + day.count;
    });

    console.log("Total Sessions:", total_sessions);
  });
});

req.on("error", (e) => {
  console.error("Something went wrong: ", e);
});
req.end();