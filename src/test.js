const { db } = require('./utils/db')

db.query('SELECT * FROM `tb_rooms`', (err,result,fields) => {
    if(err) {
        throw err
    }
    console.log(result, fields)
})

db.close()
