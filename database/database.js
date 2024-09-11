const mariadb = require('mariadb');
import dotenv from 'dotenv'

dotenv.config({path:['.env']})

const host = process.env.HOST
const user = process.env.USER
const pass = process.env.PASS
const db = process.env.DB

const pool = mariadb.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    connectionLimit: 10 // Ajusta el límite de conexiones si es necesario
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
