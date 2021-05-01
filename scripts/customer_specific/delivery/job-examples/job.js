const apiKey = "api-key-here"
const apiSecret = "api-secret-here"
const sailthru = require("sailthru-client").createSailthruClient(apiKey, apiSecret)

sailthru.apiPost("job", {
    job: "content_update",
    file: "content.txt"
}, ["file"], function(err, response) {
    if (response) {
        console.log(response)
    } else {
        console.log(err)
    }
})

