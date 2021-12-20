const fs = require('fs')
const path = require('path')

function writeFile(data, filename) {
    data = typeof data === "string" ? data : JSON.stringify(data)
    fs.writeFile(path.join(__dirname, '../'+filename), data, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

module.exports = {writeFile}