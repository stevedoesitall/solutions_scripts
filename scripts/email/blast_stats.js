const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

const logs = {
    blast_log: path.join(__dirname, "../../logs/email/blasts.txt"),
    labels_log: path.join(__dirname, "../../logs/email/labels.txt")
};

const clear_file = (file_name) => {
    fs.writeFile(file_name, "", function() { 
        console.log(file_name + " file cleared.");
    }); 
};

for (const log in logs) {
    clear_file(logs[log]);
}

const start_date = require("../modules/dates.js").start_date;
const end_date = require("../modules/dates.js").end_date;

let total_blasts = 0;
let template_blasts = 0;
let template_blasts_copied = 0;
let copied_blasts = 0;
let scratch_blasts = 0;
let used_feed = 0;

const labels = {};

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
            total_blasts++;
            if (blast.copy_blast_id && blast.copy_template) {
                template_blasts_copied++
            }
            else if (blast.copy_template) {
                template_blasts++
            }
            else if (blast.copy_blast_id) {
                copied_blasts++
            }
            else {
                scratch_blasts++
            }

            if (blast.data_feed_url) {
                used_feed++;
            }

            if (blast.labels) {
                blast.labels.forEach(label => {
                    if (labels[label]) {
                        labels[label] = labels[label] + 1;
                    }
                    else {
                        labels[label] = labels[label] = 1;
                    }
                });
            }
        });
        console.log(labels);
    }
    console.log(` Total blasts: ${total_blasts}\n Template blasts: ${template_blasts}\n Copied blasts: ${copied_blasts}\n Template blasts copied: ${template_blasts_copied}\n Scratch blasts: ${scratch_blasts}\n Used feed: ${used_feed}`);

    fs.appendFile(logs.blast_log, `Blast Type^Count` + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
        else {
            fs.appendFile(logs.blast_log, `Total blasts^${total_blasts}\nTemplate blasts^${template_blasts}\nCopied blasts^${copied_blasts}\nTemplate blasts copied^${template_blasts_copied}\nScratch blasts^${scratch_blasts}\nUsed feed^${used_feed}` + "\n", (err) => {
                if (err) {
                    console.log("Unable to append to file.");
                }
            });
        }
    });

    fs.appendFile(logs.labels_log, `Label^Count` + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
        else {
            Object.keys(labels).forEach(label => {
                fs.appendFile(logs.labels_log, `${label}^${labels[label]}` + "\n", (err) => {
                    if (err) {
                        console.log("Unable to append to file.");
                    }
                });
            });
        }
    });

});