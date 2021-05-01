const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const log = path.join(__dirname, "../../logs/email/content.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;
const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

const data = [];
const all_vars = [];
const items = 5001;

fs.writeFile(log, "", function() { 
    console.log("Content file cleared.");
});

sailthru.apiGet("content", 
    {
        items: items
    }, 
    function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            const all_content = response.content;
            console.log("GET 1");
            all_content.forEach(content => {
                if (content.vars) {
                    const content_vars = Object.keys(content.vars);
                    content_vars.forEach(content_var => {
                        if (!all_vars.includes(content_var)) {
                            all_vars.push(content_var);
                        }
                    });
                }
            });
        }
    const all_vars_sorted = all_vars.sort();
    sailthru.apiGet("content", 
    {
        items: items
    },
    function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            const all_content = response.content;
            console.log("GET 2");
            all_content.forEach(content => {
                const content_data = {};
                content_data.url = content.url.replace(/^/g, "(at)");
                if (content.date) {
                    content_data.date = content.date.replace(/,/g, " ");
                }
                else {
                    content_data.date = "[n/a]"
                }
                if (content.title) {
                    content_data.title = content.title.replace(/,/g, " - ").replace(/[^\x00-\x7F]/g, "").replace(/(?:\\[rn])+/g, "");
                    content_data.title = content_data.title.replace(/#/g, "-");
                    content_data.title = content_data.title.replace(/^/g, "(at)");
                    // content_data.title = content.title.replace(/\s\s+/g, " ");
                }
                else {
                    content_data.title = "[n/a]";
                }
                if (content.tags.length > 0) {
                    content_data.tags = content.tags.toString().replace(/,/g, "|");
                }
                else {
                    content_data.tags = "[n/a]";
                }
                if (content.views) {
                    content_data.views = content.views;
                }
                else {
                    content_data.views = 0;
                }
                if (content.expire_date) {
                    content_data.expire_date = content.expire_date.replace(/,/g, " ");
                }
                else {
                    content_data.expire_date = "[n/a]";
                }
                if (content.location) {
                    content_data.location = JSON.stringify(content.location).replace(/,/g, "|");
                    content_data.location = content_data.location.replace(/^/g, "(at)");
                }
                else {
                    content_data.location = "[n/a]";
                }
                if (content.author) {
                    content_data.author = JSON.stringify(content.author).replace(/,/g, "-");
                    content_data.author = content_data.author.replace(/^/g, "(at)");
                }
                else {
                    content_data.author = "[n/a]";
                }
                if (content.price) {
                    content_data.price = content.price;
                }
                else {
                    content_data.price = "[n/a]";
                }
                if (content.sku) {
                    content_data.sku = content.sku;
                }
                else {
                    content_data.sku = "[n/a]";
                }
                if (content.inventory) {
                    content_data.inventory = content.inventory;
                }
                else {
                    content_data.inventory = "[n/a]";
                }
                if (content.site_name) {
                    content_data.site_name = JSON.stringify(content.site_name).replace(/,/g, "-");
                }
                else {
                    content_data.site_name = "[n/a]";
                }
                if (content.images) {
                    if (content.images.full) {
                        content_data.image_full = content.images.full.url;
                    }
                    else {
                        content_data.image_full = "[n/a]";
                    }
                    if (content.images.thumb) {
                        content_data.image_thumb = content.images.thumb.url;
                    }
                    else {
                        content_data.image_thumb = "[n/a]";
                    }
                }
                else {
                    content_data.image_full = "[n/a]";
                    content_data.image_thumb = "[n/a]";
                }
                if (content.description) {
                    content_data.description = content.description.replace(/,/g, " - ").replace(/\n/g, "").replace(/[^\x00-\x7F]/g, "").replace(/\r/g, "").replace(/#/g, " no. ");
                    content_data.description = content_data.title.replace(/^/g, "(at)");
                }
                else {
                    content_data.description = "[n/a]";
                }
                if (content.vars) {
                    console.log("Content Vars:", content.vars);
                    all_vars_sorted.forEach(val => {
                        if (content.vars[val]) {
                            let content_var = content.vars[val];
                            if (typeof content_var === "object") {
                                content_var = JSON.stringify(content_var).replace(/,/g, "|");
                            }
                            else if (typeof content_var === "string") {
                                content_var = content_var.replace(/,/g, " - ").replace(/\n/g, "").replace(/\r/g, "");
                                content_var = content_var.replace(/^/g, "(at)");
                            }
                            else if (typeof content_var === "boolean") {
                                if (content_var === true) {
                                    content_var = "true";
                                }
                                else {
                                    content_var = "false";
                                }
                            }
                            content_data[val] = content_var;
                        }
                        else {
                            content_data[val] = "[n/a]";
                        }
                    });
                }
                else {
                    all_vars_sorted.forEach(val => {
                        content_data[val] = "[n/a]";
                    });
                }
                data.push(content_data);
            });
            save_data(data);
        }
    });
});

const save_data = (data) => {
    const all_fields = Object.keys(data[0]);
    let header = "";
    all_fields.forEach((field, index) => {
        const field_count = index + 1;
        if (field_count == all_fields.length) {
            header = header + field;
            console.log(header);
        }
        else {
            header = header + field + "^";
        }
    });
    fs.appendFile(log, header + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
        else {
            const items = data.slice(1, data.length);
            items.forEach(item => {
                let row = "";
                const all_values = Object.values(item);
                all_values.forEach((value, index) => {
                    const value_count = index + 1;
                    if (value_count == all_values.length) {
                        row = row + value;
                        fs.appendFile(log, row + "\n", (err) => {
                            if (err) {
                                console.log("Unable to append to file.", err, row);
                            }
                        });
                    }
                    else {
                        row = row + value + "^";
                    }
                });
            });
        }
    });
};