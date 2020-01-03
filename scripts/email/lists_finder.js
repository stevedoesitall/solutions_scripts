const path = require("path");
const creds = path.join(__dirname, "../../ignore/creds.js");
const log = path.join(__dirname, "../../logs/lists.txt");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);
const fs = require("fs");

fs.writeFile(log, "", function() { 
    console.log("Lists file cleared.");
});

let lists_obj = {};

sailthru.apiGet("list", {
    //No params
}, function(err, response) {
    if (err) {
        console.log(err);
    }

    else {
        const all_lists = response.lists;
        all_lists.forEach(list => {
            lists_obj[list.name] = {};

            lists_obj[list.name].type = list.type;
            lists_obj[list.name].send_time = "";
            lists_obj[list.name].suppress_time = "";
            lists_obj[list.name].total_sends = 0;
            lists_obj[list.name].total_suppresses = 0;
            lists_obj[list.name].status = "secondary";

            if (list.create_time == "Wed, 31 Dec 1969 19:00:00 -0500") {
                lists_obj[list.name].create_time = "";
            }
            else {
                const date = new Date(list.create_time);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();

                lists_obj[list.name].create_time = year + "-" + month + "-" + day;
            }

            sailthru.apiGet("list", {
                list: list.name
            }, function(err, response) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (response.primary == true) {
                        lists_obj[list.name].status = status = "primary";
                    }
                }
            });
        });
    }
    sailthru.apiGet("blast", {
        status: "sent",
        limit: 0
    }, function(err, response) {
        if (err) {
            console.log(err);
        }
    
        else {
            const all_blasts = response.blasts;
            all_blasts.forEach(blast => {
                let date;
                if (blast.start_time) {
                    date = new Date(blast.start_time);
                }
                else {
                    date = new Date(blast.schedule_time);
                }
                
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();

                const send_time = year + "-" + month + "-" + day;
                const send_time_unix = new Date(send_time).getTime();

                if (blast.suppress_list) {
                    const suppress_lists = blast.suppress_list;
                    suppress_lists.forEach(suppression => {
                        if (lists_obj[suppression]) {
                            lists_obj[suppression].total_suppresses++;
                            if (lists_obj[suppression].suppress_time) {
                                const suppress_time_unix = new Date(lists_obj[suppression].suppress_time).getTime();
                                if (suppress_time_unix < send_time_unix) {
                                    lists_obj[suppression].suppress_time = send_time;
                                }
                            }
                            else {
                                lists_obj[suppression].suppress_time = send_time;
                            }
                        }
                    })
                }

                if (lists_obj[blast.list]) {

                    lists_obj[blast.list].total_sends++;
                    if (lists_obj[blast.list].send_time) {
                        const blast_time_unix = new Date(lists_obj[blast.list].send_time).getTime();
                        if (blast_time_unix < send_time_unix) {
                            lists_obj[blast.list].send_time = send_time;
                        }
                    }
                    else {
                        lists_obj[blast.list].send_time = send_time;
                    }
                }
            });
        }
        save_data();
    });
});

const save_data = () => {
    const all_lists = Object.keys(lists_obj);
    fs.appendFile(log, "List Name@List Status@List Type@Create Time@Send Time@Suppress Time" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    all_lists.forEach(list => {
        fs.appendFile(log, list + "@" + lists_obj[list].status + "@" + lists_obj[list].type + "@" + lists_obj[list].create_time  + "@" + lists_obj[list].send_time + "@" + lists_obj[list].suppress_time + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
        });
    });
}