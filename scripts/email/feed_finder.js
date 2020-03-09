//BROKEN NEED TO FIX

const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const feed_log = path.join(__dirname, "../../logs/feeds.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");
const http = require("http");
const https = require("https");

fs.writeFile(feed_log, "", function() { 
    console.log("Feed file cleared.");
});

const start_date = require("../modules/dates.js").start_date;
const end_date = require("../modules/dates.js").end_date;

const feed_obj = {};

let total_blasts = 0;
let total_templates = 0;

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
        console.log("Getting blast stats...");
        const blasts = response.blasts;
        blasts.forEach(blast => {
            total_blasts++;

            if (blast.data_feed_url) {
                if (feed_obj[blast.data_feed_url]) {
                    feed_obj[blast.data_feed_url].blast_count++
                    feed_obj[blast.data_feed_url].blast_names.push(blast.name);
                }
                else {
                    feed_obj[blast.data_feed_url] = {};
                    feed_obj[blast.data_feed_url].template_names = "N/A";
                    feed_obj[blast.data_feed_url].blast_names = [];
                    feed_obj[blast.data_feed_url].blast_names.push(blast.name);
                    feed_obj[blast.data_feed_url].blast_count = 1;
                    feed_obj[blast.data_feed_url].template_count = 0;
                }
            }
        });
    }
    get_templates();
});

const get_templates = () => {
    console.log("Getting template stats...");
    sailthru.apiGet("template", {
        //No params
    }, function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            const templates = response.templates;
            templates.forEach(template => {
                total_templates++;

                if (template.data_feed_url) {

                    if (feed_obj[template.data_feed_url]) {
                        feed_obj[template.data_feed_url].template_count++

                        if (feed_obj[template.data_feed_url].template_names = "N/A"); {
                            feed_obj[template.data_feed_url].template_names = [];
                        }
                    }
                    else {
                        feed_obj[template.data_feed_url] = {};
                        feed_obj[template.data_feed_url].template_names = [];
                        feed_obj[template.data_feed_url].template_count = 1;
                    }

                    if (!feed_obj[template.data_feed_url].blast_count) {
                        feed_obj[template.data_feed_url].blast_count = 0;
                    }

                    if (!feed_obj[template.data_feed_url].blast_names) {
                        feed_obj[template.data_feed_url].blast_names = "N/A";
                    }

                    feed_obj[template.data_feed_url].template_names.push(template.name);
                }
            });
        }
        save_data();
    });
};

const save_data = () => {
    const all_feeds = Object.keys(feed_obj);

    let total_feeds = 0;

    if (all_feeds.length == 0) {
        console.log("No feeds!");
    }
    else {
        all_feeds.forEach((feed, index) => {
            if (feed.substr(0,7) === "http://") {
                http.get(feed, (cb) => {
                cb.setEncoding("utf8");
                let raw_data = "";
                cb.on("data", (chunk) => { raw_data += chunk; });
                cb.on("end", () => {
                    try {
                        total_feeds++;

                        if (raw_data.substr(4,3) == "404" || feed === null) {
                            console.log(feed + " does not exist");
                            feed_obj[feed].name = feed;
                            feed_obj[feed].exists = "N";
                            feed_obj[feed].timed_out = "N/A";
                        }

                        else if (raw_data.substr(0,6) == "<html>") {
                            console.log(feed + " is parsing HTML");
                            feed_obj[feed].name = feed;
                            feed_obj[feed].exists = "Y";
                            feed_obj[feed].timed_out = "N/A";
                        }

                        else {
                            console.log(feed);
                            feed_obj[feed].exists = "Y";
                            const parsed_data = JSON.parse(raw_data);

                            if (typeof parsed_data.feed != "undefined") {
                                feed_obj[feed].name = parsed_data.feed.name; 
                                feed_obj[feed].timed_out = "N";
                            }
                            else {
                                feed_obj[feed].name = feed;
                                feed_obj[feed].timed_out = "Y";
                            }
                        }
                        
                        if (total_feeds == 69) {
                            const all_feeds_new = Object.keys(feed_obj);
                            fs.appendFile(feed_log, `Feed Name@Send Count@Blast Count@Trigger Count@Timed Out@Blast Names@Template Names@Exists` + "\n", (err) => {
                                if (err) {
                                    console.log("Unable to append to file.");
                                }
                            });
                            
                            all_feeds_new.forEach(feed => {

                                console.log(`${feed_obj[feed].name} feed was used ${feed_obj[feed].blast_count + feed_obj[feed].template_count} times.`);
                                fs.appendFile(feed_log, `${feed_obj[feed].name}@${feed_obj[feed].blast_count + feed_obj[feed].template_count}@${feed_obj[feed].blast_count}@${feed_obj[feed].template_count}@${feed_obj[feed].timed_out}@${feed_obj[feed].blast_names}@${feed_obj[feed].template_names}@${feed_obj[feed].exists}` + "\n", (err) => {
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
            }

            // else if (feed.substr(0,8) == "https://") {
                
            // }

            // else {
                
            // }
            


        });
    }
}