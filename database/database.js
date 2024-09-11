const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: '193.203.175.136',
  user: 'u534899669_Atento21456',
  password: 'Atento21456',
  database: 'u534899669_finanzas',
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
