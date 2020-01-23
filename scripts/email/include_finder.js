const path = require("path");
const fs = require("fs");

const logs = {
    include_log: path.join(__dirname, "../../logs/includes.txt")
};

const data_files = {
    blast: path.join(__dirname, "../../su_queries/blast_data.json"),
    template: path.join(__dirname, "../../su_queries/template_data.json"),
    include: path.join(__dirname, "../../su_queries/include_data.json")
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

fs.readFile(data_files.include, (err, data) => {
    if (err) throw err;
    const content = JSON.parse(data);
    const content_ids = Object.keys(content);

    content_ids.forEach(id => {
        const include_name = content[id].name;
        all_includes[include_name] = {
            "use_count" : 0,
            "templates" : [],
            "blasts" : [],
            "includes" : []
        };
    });
});

const save_limit = 1;
let run_limit = Object.keys(data_files).length;

const get_includes = (content_data, content_type) => {

    console.log("Getting include data...");

    fs.readFile(content_data, (err, data) => {
        if (err) throw err;
        const content = JSON.parse(data);
        const content_ids = Object.keys(content);

        content_ids.forEach(id => {
            const setup = content[id].setup;
            const html = content[id].content_html;

            const name = content[id].name;

            Object.keys(all_includes).forEach(include => {
                if (html && html.indexOf(include) != -1) {
                    all_includes[include].use_count++;
                    if (content_type == "template") {
                        all_includes[include].templates.push(name);
                    }
                    else if (content_type == "blast") {
                        all_includes[include].blasts.push(name);
                    }
                    else if (content_type == "include") {
                        all_includes[include].includes.push(name);
                    }
                }
                if (setup && setup.indexOf(include) != -1) {
                    all_includes[include].use_count++;
                    if (content_type == "template") {
                        all_includes[include].templates.push(name);
                    }
                    else if (content_type == "blast") {
                        all_includes[include].blasts.push(name);
                    }
                    else if (content_type == "include") {
                        all_includes[include].includes.push(name);
                    }
                }
            });       
        });

        if (save_limit == run_limit) {
            console.log("Data saving...");
            save_data();
        }
        run_limit = run_limit - 1;
    });
};

Object.keys(data_files).forEach(type => {
    get_includes(data_files[type], type);
    console.log("Getting data for", type);
});

const save_data = () => {
    const log = logs.include_log;
    const includes = Object.keys(all_includes);
    fs.appendFile(log, "Include Name@Blast Count@Template Count" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.");
        }
    });
    includes.forEach(include => {
        fs.appendFile(log, include + "@" + all_includes[include].blasts.length + "@" + all_includes[include].templates.length + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.");
            }
        });
    })
};