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

const get_includes = () => {
    fs.readFile(data_files.include, (err, data) => {
        if (err) throw err;
        const all_include_data = JSON.parse(data);
        const all_include_ids = Object.keys(all_include_data);
        let total_includes = 1;
        all_include_ids.forEach(include => {
            const include_data = all_include_data[include]
            all_includes[include_data.name] = include_data.content_html;
            total_includes++;
            if (total_includes == all_include_ids.length) {
                // console.log(all_includes);
            }
        });
    });
};

get_includes();