const fs = require('fs')
const path = require('path')

const contentFile =  path.join(__dirname, '../scripts/customer_specific/chairish/urls.txt')
let urls = fs.readFileSync(contentFile).toString('utf-8').replace(/(?:\r\n|\r|\n)/g, '').split('https://')
urls.shift()

urls = urls.map(url => 'https://' + url)

const creds = path.join(__dirname, '../ignore/creds')
const api_key = require(creds).api_key
const api_secret = require(creds).api_secret
const sailthru = require('sailthru-client').createSailthruClient(api_key, api_secret)

console.log(urls)

const testUrls = ['https://www.chairish.com/product/2560578/rococo-italian-dining-set-11-pieces',   'https://www.chairish.com/product/2564587']

const content_data = {}

testUrls.forEach(url => {
    sailthru.apiGet('content', {
        url: url
    }, function(error, response) { 
        if (error) {
            console.log(error)
        } else {
            console.log(response)
        }
    })
})

const saveData = (data) => {
    const all_fields = Object.keys(data[0])
    let header = ''
    all_fields.forEach((field, index) => {
        const field_count = index + 1
        if (field_count == all_fields.length) {
            header = header + field
            console.log(header)
        }
        else {
            header = header + field + '@'
        }
    })
    fs.appendFile(log, header + '\n', (err) => {
        if (err) {
            console.log('Unable to append to file.')
        }
        else {
            const items = data.slice(1, data.length)
            items.forEach(item => {
                let row = ''
                const all_values = Object.values(item)
                all_values.forEach((value, index) => {
                    const value_count = index + 1
                    if (value_count == all_values.length) {
                        row = row + value
                        fs.appendFile(log, row + '\n', (err) => {
                            if (err) {
                                console.log('Unable to append to file.', err, row)
                            }
                        })
                    }
                    else {
                        row = row + value + '@'
                    }
                })
            })
        }
    })
}