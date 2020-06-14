//Probably a lot of code in here that can be consolidated; task for another day

const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const feed_log = path.join(__dirname, "../../logs/email/feeds.txt");

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
    let total_runs = 0;
    const all_feeds = Object.keys(feed_obj);

    if (all_feeds.length === 0) {
        console.log("No feeds!");
    }
    else {
        all_feeds.forEach((feed, index) => {

            let protocol;

            if (feed.indexOf("api.myson") != -1) {
                if (feed.substr(0,7) === "http://") {
                    protocol = http;
                }
                else if (feed.substr(0,8) === "https://") {
                    protocol = https;
                }
                else {
                    protocol = null;
                }
            }
            else {
                protocol = null;
            }

            if (protocol) {
                protocol.get(feed, (cb) => {
                    cb.setEncoding("utf8");
                    let raw_data = "";
                    cb.on("data", (chunk) => { raw_data += chunk; });
                    cb.on("end", () => {
                        try {
                            if (raw_data.substr(4,3) === "404" || !feed) {
                                console.log(feed + " does not exist");
                                feed_obj[feed].name = "?";
                                feed_obj[feed].exists = "N";
                                feed_obj[feed].timed_out = "N/A";
                            }
                            else if (raw_data.substr(0,6) === "<html>") {
                                console.log(feed + " is parsing HTML");
                                feed_obj[feed].name = "?";
                                feed_obj[feed].exists = "Y";
                                feed_obj[feed].timed_out = "N/A";
                            }
                            else {
                                feed_obj[feed].exists = "Y";
                                const parsed_data = JSON.parse(raw_data);

                                if (typeof parsed_data.feed != "undefined" || (parsed_data.statusCode && parsed_data.statusCode !== 404)) {
                                    feed_obj[feed].name = parsed_data.feed.name; 
                                    feed_obj[feed].timed_out = "N";
                                }
                                else {
                                    feed_obj[feed].name = "?";
                                    feed_obj[feed].timed_out = "Y";
                                }
                            }
                        } 
                        catch (e) {
                            console.error(feed + " error: " + e.message);
                            feed_obj[feed].name = "?";
                            feed_obj[feed].exists = "N";
                            feed_obj[feed].timed_out = "N/A";
                        }
                        total_runs++;
                        console.log("INDEX: " + index + ". TOTAL RUNS: " + total_runs);
                        if (total_runs === all_feeds.length) {
                            save_feed();
                        }
                    });
                }).on("error", (e) => {
                    console.error(`Got error: ${e.message}`);
                });
            }

            else {
                feed_obj[feed].name = "?";
                feed_obj[feed].exists = "?";
                feed_obj[feed].timed_out = "?";
                total_runs++;
                console.log("INDEX: " + index + ". TOTAL RUNS: " + total_runs);
                if (total_runs === all_feeds.length) {
                    save_feed();
                }
            }
        });
    }
}

const save_feed = () => {
    const all_feeds_new = Object.keys(feed_obj);
    fs.appendFile(feed_log, `Feed Name@Feed URL@Send Count@Blast Count@Trigger Count@Timed Out@Blast Names@Template Names@Exists` + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
        else {
            all_feeds_new.forEach(feed => {
                console.log(`${feed_obj[feed].name} feed was used ${feed_obj[feed].blast_count + feed_obj[feed].template_count} times.`);
                fs.appendFile(feed_log, `${feed_obj[feed].name}@${feed}@${feed_obj[feed].blast_count + feed_obj[feed].template_count}@${feed_obj[feed].blast_count}@${feed_obj[feed].template_count}@${feed_obj[feed].timed_out}@${feed_obj[feed].blast_names}@${feed_obj[feed].template_names}@${feed_obj[feed].exists}` + "\n", (err) => {
                    if (err) {
                        console.log("Unable to append to file.");
                    }
                });
            });
        }
    });
};