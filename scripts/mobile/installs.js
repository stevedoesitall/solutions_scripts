const https = require("https");
const path = require("path");

const creds = path.join(__dirname, "../../ignore/creds.js");
const api_key = require(creds).mobile_api_key;

const authorization = "Basic " + Buffer.from(api_key, "utf8").toString("base64");
const endpoint = "total_installs";

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
  console.log("Status Code:", res.statusCode);

  res.setEncoding("utf8");
  let raw_data = "";
  res.on("data", (chunk) => { raw_data += chunk; });
  res.on("end", () => {
    const response = JSON.parse(raw_data)
    console.log("Total Installs:", response.total_installs);
  });
});

req.on("error", (e) => {
  console.error("Something went wrong: ", e);
});
req.end();