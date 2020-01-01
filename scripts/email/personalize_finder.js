const path = require("path");
const fs = require("fs");
const personalizing_log = path.join(__dirname, "../../logs/personalizing.txt");
const canceling_log = path.join(__dirname, "../../logs/canceling.txt");

const blast_data = path.join(__dirname, "../../su_queries/blast_data.json");
const template_data = path.join(__dirname, "../../su_queries/template_data.json");

const clear_file = (file_name) => {
    fs.writeFile(file_name, "", function() { 
        console.log(file_name + " file cleared.");
    }); 
}

clear_file(personalizing_log);
clear_file(canceling_log);

let total_blasts;
let total_templates; 

let personalize_count = 0;
let cancel_count = 0;

const personalize_obj = {};
const canceled_obj = {};

fs.readFile(blast_data, (err, data) => {
    if (err) throw err;
    const blasts = JSON.parse(data);
    const blast_ids = Object.keys(blasts);

    total_blasts = blast_ids.length;

    blast_ids.forEach(id => {
        const setup = blasts[id].setup;
        const html = blasts[id].content_html;
        const name = blasts[id].name;
        console.log(name);
        if ((setup && setup.indexOf("personalize(") != -1) || (html && html.indexOf("personalize(") != -1)) {
            personalize_count++;
            personalize_obj[name] = {};
            personalize_obj[name].type = "blast";
        }
        if ((setup && setup.indexOf("cancel(") != -1) || (html && html.indexOf("cancel(") != -1)) {
            cancel_count++;
            canceled_obj[name] = {};
            canceled_obj[name].type = "blast";
        }
        else if ((setup && setup.indexOf("assert(") != -1) || (html && html.indexOf("assert(") != -1)) {
            cancel_count++;
            canceled_obj[name] = {};
            canceled_obj[name].type = "blast";
        } 
    });
    save_data();
});

fs.readFile(template_data, (err, data) => {
    if (err) throw err;
    const templates = JSON.parse(data);
    const template_ids = Object.keys(templates);

    total_templates = template_ids.length;

    template_ids.forEach(id => {
        const setup = templates[id].setup;
        const html = templates[id].content_html;
        const name = templates[id].name;
        console.log(name);
        if ((setup && setup.indexOf("personalize(") != -1) || (html && html.indexOf("personalize(") != -1)) {
            personalize_count++;
            personalize_obj[name] = {};
            personalize_obj[name].type = "template";
        }
        if ((setup && setup.indexOf("cancel(") != -1) || (html && html.indexOf("cancel(") != -1)) {
            cancel_count++;
            canceled_obj[name] = {};
            canceled_obj[name].type = "template";
        }
        else if ((setup && setup.indexOf("assert(") != -1) || (html && html.indexOf("assert(") != -1)) {
            cancel_count++;
            canceled_obj[name] = {};
            canceled_obj[name].type = "template";
        } 
    });
});

const save_data = () => {
    const personalized = Object.keys(personalize_obj);
    fs.appendFile(personalizing_log, "name@type" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    personalized.forEach(item => {
        fs.appendFile(personalizing_log, item + "@" + personalize_obj[item].type + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
        });
    });

    const canceled = Object.keys(canceled_obj);
    fs.appendFile(canceling_log, "name@type" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    canceled.forEach(item => {
        fs.appendFile(canceling_log, item + "@" + canceled_obj[item].type + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
        });
    });
}