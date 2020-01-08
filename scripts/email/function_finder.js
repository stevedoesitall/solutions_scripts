const path = require("path");
const fs = require("fs");
const creds = path.join(__dirname, "../../ignore/creds.js");

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const logs = {
    personalizing_log: path.join(__dirname, "../../logs/personalizing.txt"),
    canceling_log: path.join(__dirname, "../../logs/canceling.txt")
};

const data_files = {
    blast: path.join(__dirname, "../../su_queries/blast_data.json"),
    template: path.join(__dirname, "../../su_queries/template_data.json")
};

const clear_file = (file_name) => {
    fs.writeFile(file_name, "", function() { 
        console.log(file_name + " file cleared.");
    }); 
};

Object.values(logs).forEach(log => {
    clear_file(log);
});

const all_includes = {};
/*
Ideal sample structure:
{
    "include_name" : {
        "use_count": 10,
        "templates": ["Template 1", "Template 2"],
        "content_html": "<p>Content</p>"
    }
}
*/

const function_data = {
    personalize: {
        obj: {},
        log: logs.personalizing_log,
        header: "Name@Type@Function"
    },
    cancel: {
        obj: {},
        log: logs.canceling_log,
        header: "Name@Type@Function@Convertible (Y/N)@Notes"
    }
};

/*
Hacky way to get the save_date() function to run once,
should think of a cleaner way to execute.
*/

const save_limit = 1;
let run_limit = Object.keys(data_files).length;

//Currently does not parse includes; will want to eventually update for that
const get_data = (content_data, content_type) => {

    console.log("Getting data...");

    fs.readFile(content_data, (err, data) => {
        if (err) throw err;
        const content = JSON.parse(data);
        const content_ids = Object.keys(content);
    
        total_content = content_ids.length;
    
        content_ids.forEach(id => {
            const setup = content[id].setup;
            const html = content[id].content_html;
            const name = content[id].name;
            const args = {
                personalize: {
                    functions: ["personalize(", "horizon_select("],
                    obj: function_data.personalize.obj
                },
                cancel: {
                    functions: ["cancel(", "assert("],
                    obj: function_data.cancel.obj
                }
            };

            const function_types = Object.keys(args);

            const find_functions = (array_name, obj_name) => {
                for (let x = 0; x < array_name.length; x++) {
                    const function_name = array_name[x];
                    if ((setup && setup.indexOf(function_name) != -1) || (html && html.indexOf(function_name) != -1)) {
                        obj_name[name] = {};
                        obj_name[name].type = content_type;
                        obj_name[name].function = function_name + ")";
                        break;
                    }
                    // else if ((setup && setup.indexOf("{include") != -1) || (html && html.indexOf("{include") != -1)) {
                    //     console.log()
                    // }
                };
            };

            function_types.forEach(type => {
                const functions = args[type].functions;
                const obj = args[type].obj;
                find_functions(functions, obj);
            });

        });
        if (save_limit == run_limit) {
            save_data();
            console.log("Data saving...");
        }
        run_limit = run_limit - 1;
    });
};

Object.keys(data_files).forEach(type => {
    get_data(data_files[type], type);
});

const get_includes = () => {
    sailthru.apiGet("include", 
    {
        //No params
    }, function(err, response) {
        if (err) {
            console.log(err);
        }
        else {
            const includes = response.includes;
            const include_length = includes.length;
            let counter = 0;
            let timer = 0;
            includes.forEach(include => {
                setTimeout(function() {
                    sailthru.apiGet("include", 
                    {
                        include: include.name
                    }, function(err, response) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            all_includes[include.name];
                        }
                    });
                    timer = timer + 50;
                    // counter = counter + 1;
                    // if (counter == include_length) {
                    //     console.log(all_includes);
                    // }
                    console.log(timer);
                }, timer);
            });
        }
    });
}

const save_data = () => {
    // get_includes();
    const function_names = Object.keys(function_data);

    function_names.forEach(name => {
        const content = Object.keys(function_data[name].obj);
        const log_name = function_data[name].log;
        const header = function_data[name].header;

        fs.appendFile(log_name, header + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.", err);
            }
            else {
                console.log("Header appended to file.");
            }
        });

        content.forEach(item => {
            const type = function_data[name].obj[item].type;
            const functon_name = function_data[name].obj[item].function;
            fs.appendFile(log_name, item + "@" + type + "@" + functon_name + "\n", (err) => {
                if (err) {
                    console.log("Unable to append to file.", err);
                }
            });
        });
    });
};