const mysql = require ('mysql');



/*
const mysqlConnection = mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    connectionLimit: 10
});


const mysqlConnection = mysql.createConnection({
    connectionLimit: 10,
    host: '34.135.202.215',
    user: 'apinfocoredb',
    password: 'Cpa4OElxoGcitbCG',
    database: 'apinfocoredb'
  })
*/

const mysqlConnection = mysql.createConnection({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'finanzas'
  })


mysqlConnection.connect(function (err){
    if(err) {
        console.log(err);
        return;
    } else {
        console.log('Db is connected');
    }
});

module.exports = mysqlConnection;