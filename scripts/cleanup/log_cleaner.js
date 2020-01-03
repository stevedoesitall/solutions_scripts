const path = require("path");
const fs = require("fs");
const log_folder = path.join(__dirname, "../../logs/");

fs.readdir(log_folder, function(err, logs) {
    if (err) {
        console.log(err);
    }
    else {
        logs.forEach(log => {
            const log_path = path.join(log_folder + "/", log);
            fs.writeFile(log_path, "", function() { 
                console.log(log_path + " file cleared.");
            }); 
        });
    }
});