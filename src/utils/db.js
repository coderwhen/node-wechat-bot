const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_wechaty_bot'
})

db.connect()

module.exports = {
    db
}