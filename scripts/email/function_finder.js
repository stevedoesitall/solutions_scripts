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
};

clear_file(personalizing_log);
clear_file(canceling_log);

const personalize_obj = {};
const canceled_obj = {};

const get_data = (content_data, content_type) => {
    fs.readFile(content_data, (err, data) => {
        if (err) throw err;
        const content = JSON.parse(data);
        const content_ids = Object.keys(content);
    
        total_content = content_ids.length;
    
        content_ids.forEach(id => {
            const setup = content[id].setup;
            const html = content[id].content_html;
            const name = content[id].name;
            console.log(name);
            if ((setup && setup.indexOf("personalize(") != -1) || (html && html.indexOf("personalize(") != -1)) {
                personalize_obj[name] = {};
                personalize_obj[name].type = content_type;
                personalize_obj[name].function = "personalize()";
            }
            else if ((setup && setup.indexOf("horizon_select(") != -1) || (html && html.indexOf("horizon_select(") != -1)) {
                personalize_obj[name] = {};
                personalize_obj[name].type = content_type;
                personalize_obj[name].function = "horizon_select()";
            }
    
            if ((setup && setup.indexOf("cancel(") != -1) || (html && html.indexOf("cancel(") != -1)) {
                canceled_obj[name] = {};
                canceled_obj[name].type = content_type;
                canceled_obj[name].function = "cancel()";
            }
            else if ((setup && setup.indexOf("assert(") != -1) || (html && html.indexOf("assert(") != -1)) {
                canceled_obj[name] = {};
                canceled_obj[name].type = content_type;
                canceled_obj[name].function = "assert()";
            } 
        });
        save_data();
    });
};

get_data(blast_data, "blast");
get_data(template_data, "template");

const save_data = () => {
    const personalized = Object.keys(personalize_obj);
    fs.appendFile(personalizing_log, "Name@Type@Function" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    personalized.forEach(item => {
        fs.appendFile(personalizing_log, item + "@" + personalize_obj[item].type + "@" + personalize_obj[item].function + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
        });
    });

    const canceled = Object.keys(canceled_obj);
    fs.appendFile(canceling_log, "Name@Type@Function@Convertible (Y/N)@Notes" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    canceled.forEach(item => {
        fs.appendFile(canceling_log, item + "@" + canceled_obj[item].type + "@" + canceled_obj[item].function + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
        });
    });
};