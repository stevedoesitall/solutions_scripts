const path = require("path");
const creds = path.join(__dirname, "../ignore/creds.js");
const log = path.join(__dirname, "../logs/triggers.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

const template_triggers = [];
let total_templates;

fs.writeFile(log, "", function() { 
    console.log("Trigger file cleared.");
});

sailthru.apiGet("template", {
    //No params
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        let template_count = 0;
        total_templates = response.templates.length;
        response.templates.forEach(template => {
            sailthru.apiGet("trigger", {
                template: template.name
            }, function(err, response) {
                if (err) {
                    //No triggers
                }
                else {
                    template_triggers.push(template.name);
                    console.log("Success", template.name);
                    fs.appendFile(log, template.name + "\n", (err) => {
                        if (err) {
                            console.log("Unable to append to file.");
                        }
                    });
                }
                template_count++;
                console.log(`Template Count: ${template_count}. Total Templates: ${total_templates}`);
                if (template_count == total_templates) {
                    console.log(template_triggers);
                }
            });
        });
    }
});