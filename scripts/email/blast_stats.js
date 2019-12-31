const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const blast_log = path.join(__dirname, "../../logs/blasts.txt");
const feed_log = path.join(__dirname, "../../logs/feeds.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");
const http = require("http");

fs.writeFile(blast_log, "", function() { 
    console.log("Blast file cleared.");
});

fs.writeFile(feed_log, "", function() { 
    console.log("Feed file cleared.");
});

const start_date = require("../modules/dates.js").start_date;
const end_date = require("../modules/dates.js").end_date;

const feed_obj = {};
let total_blasts = 0;
let template_blasts = 0;
let template_blasts_copied = 0;
let copied_blasts = 0;
let scratch_blasts = 0;
let used_feed = 0;

//Need to save data to a file

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
                if (feed_obj[blast.data_feed_url]) {
                    feed_obj[blast.data_feed_url].count++
                }
                else {
                    feed_obj[blast.data_feed_url] = {};
                    feed_obj[blast.data_feed_url].count = 1;
                }
            }
        });
    }
    console.log(` Total blasts: ${total_blasts}\n Template blasts: ${template_blasts}\n Copied blasts: ${copied_blasts}\n Template blasts copied: ${template_blasts_copied}\n Scratch blasts: ${scratch_blasts}\n Used feed: ${used_feed}`);

    fs.appendFile(blast_log, `Blast Type@Count` + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });

    fs.appendFile(blast_log, `Total blasts@${total_blasts}\nTemplate blasts@${template_blasts}\nCopied blasts@${copied_blasts}\nTemplate blasts copied@${template_blasts_copied}\nScratch blasts@${scratch_blasts}\nUsed feed@${used_feed}` + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });

    const all_feeds = Object.keys(feed_obj);

    let total_feeds = 0;

    all_feeds.forEach(feed => {
        http.get(feed, (cb) => {
            cb.setEncoding("utf8");
            let raw_data = "";
            cb.on("data", (chunk) => { raw_data += chunk; });
            cb.on("end", () => {
                try {
                    total_feeds++;
                    const parsed_data = JSON.parse(raw_data);
                    feed_obj[feed].name = parsed_data.feed.name; 
                    if (total_feeds == all_feeds.length) {
                        const all_feeds_new = Object.keys(feed_obj);
                        fs.appendFile(feed_log, `Feed Name@Send Count` + "\n", (err) => {
                            if (err) {
                                console.log("Unable to append to file.");
                            }
                        });
                        
                        all_feeds_new.forEach(feed => {

                            console.log(`${feed_obj[feed].name} feed was used ${feed_obj[feed].count} times.`);
                            fs.appendFile(feed_log, `${feed_obj[feed].name}@${feed_obj[feed].count}` + "\n", (err) => {
                                if (err) {
                                    console.log("Unable to append to file.");
                                }
                            });
                        });
                    }
                } 
                catch (e) {
                    console.error(e.message);
                }
            });
            }).on("error", (e) => {
                console.error(`Got error: ${e.message}`);
        });
    });
});