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
            const personalize_functions = ["personalize(", "horizon_select("];
            const cancel_functions = ["cancel(", "assert("];

            const find_functions = (array_name, obj_name) => {
                for (let x = 0; x < array_name.length; x++) {
                    const function_name = array_name[x];
                    if ((setup && setup.indexOf(function_name) != -1) || (html && html.indexOf(function_name) != -1)) {
                        obj_name[name] = {};
                        obj_name[name].type = content_type;
                        obj_name[name].function = function_name + ")";
                        break;
                    }
                };
            }

            find_functions(personalize_functions, personalize_obj);
            find_functions(cancel_functions, canceled_obj);   
        });
        save_data();
    });
};

get_data(blast_data, "blast");
get_data(template_data, "template");

const save_data = () => {
    const obj_array = [personalize_obj, canceled_obj];
    let header;
    let log_name;

    obj_array.forEach(obj_name => {
        if (obj_name == personalize_obj) {
            header = "Name@Type@Function";
            log_name = personalizing_log;
        }
        else if (obj_name == canceled_obj) {
            header = "Name@Type@Function@Convertible (Y/N)@Notes";
            log_name = canceling_log;
        }

        const content = Object.keys(obj_name);
        fs.appendFile(log_name, header + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.");
            }
        });
        content.forEach(item => {
            fs.appendFile(log_name, item + "@" + obj_name[item].type + "@" + obj_name[item].function + "\n", (err) => {
                if (err) {
                    console.log("Unable to append to file.", err);
                }
            });
        });
    });
};