const path = require("path");
const creds = path.join(__dirname, "../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

fs.writeFile("logs/templates.txt", "", function() { 
    console.log("Templates file cleared.");
});

const start_date = require("./modules/dates.js").start_date;
const end_date = require("./modules/dates.js").end_date;
   
console.log(`Finding stats between ${start_date} and ${end_date}`);

let templates_obj = {};

sailthru.apiGet("template", {
    //No params
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        total_templates = response.templates.length;
        response.templates.forEach(template => {
            sailthru.apiGet("stats", {
                stat: "send",
                start_date: start_date,
                end_date: end_date,
                template: template.name
            }, function(err, response) {

                templates_obj[template.name] = {};

                if (err) {
                    templates_obj[template.name].trigger_count = 0;
                }
                else {
                    templates_obj[template.name].trigger_count = response.count;
                }

            });
        });
        get_blasts();
    }
});

const get_blasts = () => {
    sailthru.apiGet("blast", {
        start_date: start_date,
        end_date: end_date,
        status: "sent",
        limit: 0
    }, function(err, response) {
        if (err) {
            console.log("ERROR:", err);
        }
        else {
            const blasts = response.blasts;
            blasts.forEach(blast => {
                if (blast.copy_template) {
                    if (templates_obj[blast.copy_template]) {
                        if (templates_obj[blast.copy_template].blast_count) {
                            templates_obj[blast.copy_template].blast_count = templates_obj[blast.copy_template].blast_count + blast.email_count;
                        }
                        else {
                            templates_obj[blast.copy_template].blast_count = blast.email_count; 
                        }
                    }
                    else {
                        templates_obj[blast.copy_template].blast_count = blast.email_count; 
                    }
                }
            })
            save_data();
        }
    });
}

const save_data = () => {
    const all_templates = Object.keys(templates_obj);
    fs.appendFile("logs/templates.txt", "template name@blast count@trigger count" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    all_templates.forEach(template => {
        if (!templates_obj[template].trigger_count) {
            templates_obj[template].trigger_count = 0;
        }
        if (!templates_obj[template].blast_count) {
            templates_obj[template].blast_count = 0;
        }
        fs.appendFile("logs/templates.txt", template + "@" + templates_obj[template].blast_count + "@" + templates_obj[template].trigger_count + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.");
            }
        });
    })
};