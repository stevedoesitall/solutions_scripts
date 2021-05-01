const path = require("path")
const fs = require("fs")
const creds = path.join(__dirname, "../../ignore/creds.js")
const log = path.join(__dirname, "../../logs/email/events.txt")


const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const eventCount = {}

sailthru.apiGet("lifecycle", {
}, function(err, response) {
    if (err) {
        console.log("Error getting Lifecycles! ", err)
    } else {
        response.forEach(flow => {
            const entryId = flow.entry
            const steps = flow.steps
            const subtype = steps[entryId].subtype
            if (subtype === "customEvent") {
                const eventName = steps[entryId].taskAttributes.event
                if (flow.status === "active") {
                    if (eventCount[eventName]) {
                        eventCount[eventName]++
                    } else {
                        eventCount[eventName] = {}
                        eventCount[eventName] = 1
                    }
                }
            }
        })

        fs.appendFile(log, "Event Name^Count" + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.");
            }
        });

        for (let event in eventCount) {
            fs.appendFile(log, event + "^" + eventCount[event] + "\n", (err) => {
                if (err) {
                    console.log("Unable to append to file.");
                }
            })
        }
    }
})