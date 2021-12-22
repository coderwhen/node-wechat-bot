const js = "const { db } = require('./utils/db')\n" +
    "\n" +
    "db.query('SELECT * FROM `tb_rooms`', (err,result,fields) => {\n" +
    "    if(err) {\n" +
    "        throw err\n" +
    "    }\n" +
    "    console.log(result, fields)\n" +
    "db.destroy()" +
    "})"
eval(js)
