const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
  connectionLimit: 10
});

async function getConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Db is connected');
    return conn; // Devuelve la conexión para que pueda ser utilizada en los controladores
  } catch (err) {
    console.error('Error connecting to the database:', err);
    throw err; // Lanza el error para que pueda ser manejado en los controladores
  }
}

module.exports = { getConnection };
