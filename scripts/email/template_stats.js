const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const log = path.join(__dirname, "../../logs/templates.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

fs.writeFile(log, "", function() { 
    console.log("Templates file cleared.");
});

const start_date = require("../modules/dates.js").start_date;
const end_date = require("../modules/dates.js").end_date;
   
console.log(`Finding stats between ${start_date} and ${end_date}`);

const templates_obj = {};
let total_calls = 0;

sailthru.apiGet("template", {
    //No params
}, function(err, response) {
    if (err) {
        console.log(err);
    }
    else {
        total_templates = response.templates.length;
        console.log(total_templates);
        response.templates.forEach(template => {
            let template_name;
            
            if (template.sample) {
                template_name = template.name + " [" + template.sample + "]";
            }
            else {
                template_name = template.name;
            }

            templates_obj[template_name] = {};

            sailthru.apiGet("stats", {
                stat: "send",
                start_date: start_date,
                end_date: end_date,
                template_id: template.template_id
            }, function(err, response) {

                if (err) {
                    templates_obj[template_name].trigger_count = 0;
                    // console.log(err);
                }
                else {
                    templates_obj[template_name].trigger_count = response.count;
                }

                console.log(total_calls, total_templates);

                total_calls++;

                if (total_calls == total_templates) {
                    console.log(templates_obj);
                    console.log("Triggering get_blasts()");
                    get_blasts();
                }
            });
        });
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
            console.log("Error retrieving blasts:", err);
        }
        else {
            const blasts = response.blasts;
            console.log(blasts);
            blasts.forEach(blast => {
                if (blast.copy_template) {
                    if (templates_obj[blast.copy_template]) {
                        if (templates_obj[blast.copy_template].blast_count) {
                            templates_obj[blast.copy_template].blast_count = templates_obj[blast.copy_template].blast_count + 1;
                        }
                        else {
                            templates_obj[blast.copy_template].blast_count = 1; 
                        }
                    }
                    else {
                        templates_obj[blast.copy_template] = {};
                        templates_obj[blast.copy_template].blast_count = 1; 
                    }
                }
            })
            save_data();
        }
    });
}

const save_data = () => {
    const all_templates = Object.keys(templates_obj);
    console.log("All templates length:", all_templates.length);
    fs.appendFile(log, "Template Name@Blast Count@Send Count" + "\n", (err) => {
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
        fs.appendFile(log, template + "@" + templates_obj[template].blast_count + "@" + templates_obj[template].trigger_count + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.");
            }
        });
    })
};