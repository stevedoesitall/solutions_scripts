const path = require("path");
const fs = require("fs");
const personalizing_log = path.join(__dirname, "../../logs/personalizing.txt");

const blast_data = path.join(__dirname, "../../su_queries/blast_data.json");
const template_data = path.join(__dirname, "../../su_queries/template_data.json");

fs.writeFile(personalizing_log, "", function() { 
    console.log("Personalizing file cleared.");
});

let total_blasts;
let personalize_count = 0;
let cancel_count = 0;

const personalize_obj = {};

fs.readFile(blast_data, (err, data) => {
    if (err) throw err;
    const blasts = JSON.parse(data);
    const blast_ids = Object.keys(blasts);

    total_blasts = blast_ids.length;

    blast_ids.forEach(id => {
        const setup = blasts[id].setup;
        const html = blasts[id].content_html;
        const name = blasts[id].name;
        if ((setup && setup.indexOf("personalize(") != -1) || (html && html.indexOf("personalize(") != -1)) {
            personalize_count++;
            personalize_obj[name] = {};
            personalize_obj[name].type = "blast";
        }
        if ((setup && setup.indexOf("cancel(") != -1) || (html && html.indexOf("cancel(") != -1)) {
            cancel_count++;
            // canceled_blasts.push(name);
        }
        else if ((setup && setup.indexOf("assert(") != -1) || (html && html.indexOf("assert(") != -1)) {
            cancel_count++;
            // canceled_blasts.push(name);
        } 
    });
    // console.log('Total Blasts', total_blasts);
    // console.log('Total Personalized Blasts:', personalize_count);
    // console.log('Total Canceled Blasts:', cancel_count, canceled_ids);
    save_data();
});

const save_data = () => {
    const personalized = Object.keys(personalize_obj);
    console.log(personalized);
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
}