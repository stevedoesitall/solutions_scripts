const groveContent = require('./grove-content.json')

const allIDs = Object.keys(groveContent)
const allVars = {}

allIDs.forEach(id => {
    const content = groveContent[id]
    if (content.vars) {
        const itemVars = Object.keys(content.vars)
        itemVars.forEach(itemVar => {
            if (!allVars[itemVar]) {
                allVars[itemVar] = 1
            }
            else {
                allVars[itemVar]++
            }
        })
    }
})

console.log(
    `Total items: ${allIDs.length}.
    All var data: ${allVars}`
)