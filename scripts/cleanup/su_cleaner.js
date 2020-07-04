//Create SU Query Cleanup File

const path = require("path");
const fs = require("fs");
const su_folder = path.join(__dirname, "../../su_queries/");

fs.readdir(su_folder, function(err, queries) {
    if (err) {
        console.log(err);
    }
    else {
        queries.forEach(query => {
            console.log(su_folder)
            const folder = path.join(su_folder + "/", query);
            fs.writeFile(folder, "", function() { 
                console.log(queries + " file cleared.");
            }); 
        });
    }
});