const path = require("path");
const fs = require("fs");

//Update these to objects and loop over to make code more prograammatic
const personalizing_log = path.join(__dirname, "../../logs/personalizing.txt");
const canceling_log = path.join(__dirname, "../../logs/canceling.txt");

const data_files = {
    blast_data: path.join(__dirname, "../../su_queries/blast_data.json"),
    template_data: path.join(__dirname, "../../su_queries/template_data.json")
};

const clear_file = (file_name) => {
    fs.writeFile(file_name, "", function() { 
        console.log(file_name + " file cleared.");
    }); 
};

//Loop through based on the above notes
clear_file(personalizing_log);
clear_file(canceling_log);

const personalize_obj = {};
const canceled_obj = {};

/*
Hacky way to get the save_date() function to run once,
should think of a cleaner way to execute.
*/

const save_limit = 1;
let run_limit = Object.keys(data_files);

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

            const find_functions = (array_name, obj_name, log_name) => {
                for (let x = 0; x < array_name.length; x++) {
                    const function_name = array_name[x];
                    if ((setup && setup.indexOf(function_name) != -1) || (html && html.indexOf(function_name) != -1)) {
                        obj_name[name] = {};
                        obj_name[name].type = content_type;
                        obj_name[name].function = function_name + ")";
                        break;
                    }
                };
            };

            find_functions(personalize_functions, personalize_obj, personalizing_log);
            find_functions(cancel_functions, canceled_obj, canceling_log);   
        });
        if (save_limit == run_limit) {
            save_data();
            console.log("Data saving...");
        }
        run_limit = run_limit - 1;
    });
};

//Loop through based on the above notes
get_data(data_files.blast_data, "blast");
get_data(data_files.template_data, "template");

const save_data = () => {
    let header;
    let log_name;

    const obj_array = [personalize_obj, canceled_obj];

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

        console.log(content[0]);

        fs.appendFile(log_name, header + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
            else {
                console.log("Header appended to file.");
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