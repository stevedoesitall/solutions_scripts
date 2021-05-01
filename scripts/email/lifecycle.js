const path = require("path")
const fs = require("fs")
const creds = path.join(__dirname, "../../ignore/creds.js")
const flowLog = path.join(__dirname, "../../logs/email/lo.txt")
const entryLog = path.join(__dirname, "../../logs/email/entries.txt")

fs.writeFile(flowLog, "", function() { 
    console.log("Lists file cleared.")
})

fs.writeFile(entryLog, "", function() { 
    console.log("Lists file cleared.")
})


const api_key = require(creds).api_key
const api_secret = require(creds).api_secret

const sailthru = require("sailthru-client").createSailthruClient(api_key, api_secret)

const lifecycles = []
const loCount = {}
let allLists = {}

sailthru.apiGet("list", {
}, function(err, response) {
    if (err) {
        console.log("Error getting Lists! ", err)
    } else {
        response.lists.forEach(list => {
            allLists[list.list_id] = list.name
        })
    }
})

sailthru.apiGet("lifecycle", {
}, function(err, response) {
    if (err) {
        console.log("Error getting Lifecycles! ", err)
    } else {
        response.forEach(flow => {
            console.log(flow.steps)
            if (flow.status === "active") {
                const entry = flow.entry
                const steps = flow.steps[entry]
                const type = steps.subtype
                const loObj = {
                    name: flow.name,
                    type: type
                }

                let listName = "N/A"

                if (type === "addedToList") {
                    const listId = steps.taskAttributes.listId
                    listName = allLists[listId]
                }

                if (loCount[type]) {
                    loCount[type]++
                } else {
                    loCount[type] = 1
                }

                loObj.listName = listName

                lifecycles.push(loObj)
            }
        })
    }

    fs.appendFile(flowLog, "Flow Name^Type^List Name" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.")
        }
    })

    for (let flow of lifecycles) {
        fs.appendFile(flowLog, flow.name + "^" + flow.type + "^" + flow.listName + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.")
            }
        })
    }

    fs.appendFile(entryLog, "Flow Type^Count" + "\n", (err) => {
        if (err) {
            console.log("Unable to append to file.")
        }
    })

    for (let flow in loCount) {
        fs.appendFile(entryLog, flow + "^" + loCount[flow] + "\n", (err) => {
            if (err) {
                console.log("Unable to append to file.")
            }
        })
    }

    // console.log(loCount)

})