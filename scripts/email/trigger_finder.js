const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const log = path.join(__dirname, "../../logs/email/triggers.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

const template_triggers = [];
let total_templates;

fs.writeFile(log, "", function() { 
    console.log("Trigger file cleared.");
});

fs.appendFile(log, "type@name" + "\n", (err) => {
    if (err) {
        console.log("Unable to append to file.");
    }
});

sailthru.apiGet("trigger", {
    //No params
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        const global_trigger = response.triggers;
        global_trigger.forEach(trigger => {
            fs.appendFile(log, "global@" + trigger.event + "\n", (err) => {
                if (err) {
                    console.log("Unable to append to file.");
                }
            });
        })
    }
});


sailthru.apiGet("template", {
    //No params
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        total_templates = response.templates.length;
        response.templates.forEach((template, index) => {
            const trigger_obj = {};
            
            const template_count = index + 1;

            let template_name = template.name;

            trigger_obj.template = template_name;

            if (template.sample) {
                trigger_obj.sample = template.sample;
                template_name = template_name + " [" + template.sample + "]";
            }

            sailthru.apiGet("trigger", trigger_obj, function(err, response) {
                if (err) {
                    console.log("No trigger on template", template_name);
                }
                else {
                    template_triggers.push(template_name);
                    console.log("Success", response);
                    fs.appendFile(log, "template@" + template_name + "\n", (err) => {
                        if (err) {
                            console.log("Unable to append to file.");
                        }
                    });
                }
                console.log(`Template Count: ${template_count}. Total Templates: ${total_templates}`);
                if (template_count === total_templates) {
                    console.log(template_triggers);
                }
            });
        });
    }
});