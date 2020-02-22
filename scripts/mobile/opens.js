const https = require("https");
const path = require("path");

const creds = path.join(__dirname, "../../ignore/creds.js");
const api_key = require(creds).mobile_api_key;

const authorization = "Basic " + new Buffer(api_key, "utf8").toString("base64");
const endpoint = "opens";

const options = {
  hostname: "api.carnivalmobile.com",
  path: "/v6/stats/" + endpoint + "?",
  port: null,
  headers: {
    authorization,
    accept : "application/json"
  } 
};

const req = https.get(options, (res) => {
  let total_opens = 0;
  console.log("statusCode:", res.statusCode);
  console.log("headers:", res.headers);

  res.setEncoding("utf8");
  let raw_data = "";
  res.on("data", (chunk) => { raw_data += chunk; });
  res.on("end", () => {
    const response = JSON.parse(raw_data)
    response.forEach(day => {
      total_opens = total_opens + day.count;
    });

    console.log("Total Opens:", total_opens);
  });
});

req.on("error", (e) => {
  console.error("Something went wrong: ", e);
});
req.end();