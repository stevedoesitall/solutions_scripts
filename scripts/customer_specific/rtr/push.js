const path = require("path")
const creds = path.join(__dirname, "../../../ignore/creds.js")

const api_key = require(creds).api_key;
const api_secret = require(creds).api_secret;

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret);

const pushFlows = []

sailthru.apiGet("lifecycle", {
    //No params
}, function(err, response) {
    if (err) {
        console.log("Error getting Lifecycles! ", err)
    } else {
        response.forEach(flow => {
            const steps = Object.keys(flow.steps)
            steps.forEach(step => {
                const subtype = flow.steps[step].subtype
                if (subtype === "pushNotification" && flow.status == "active" && !pushFlows.includes(flow.name)) {
                    pushFlows.push(flow.name)
                }
            })
        })
    }

    console.log(`${pushFlows.length} total flows found:`)
    pushFlows.forEach(flow => {
        console.log(flow)
    })
})