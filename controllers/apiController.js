const { getConnection } = require("../database/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Crear usuario
const crearUsuario = async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  const fechaRegistro = new Date();

  try {
    // Hash the password
    const hashedPassword = bcrypt.hashSync(contrasena, 10);

    const conn = await getConnection();
    const query = `INSERT INTO usuarios (nombre, email, contrasena, fecha_registro) VALUES (?, ?, ?, ?);`;
    await conn.query(query, [nombre, email, hashedPassword, fechaRegistro]);

    conn.end(); // Cerrar la conexión al terminar
    res.json({ Status: "Usuario Registrado" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

// Login usuario
const loginUsuario = async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const conn = await getConnection();
    const query = "SELECT * FROM usuarios WHERE email = ?";
    const results = await conn.query(query, [email]);

    if (results.length === 0) {
      conn.end(); // Cerrar la conexión al terminar
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];

    // Check if password matches
    if (bcrypt.compareSync(contrasena, user.contrasena)) {
      // Create JWT token
      const token = jwt.sign({ id: user.id_usuario }, "secretKey", { expiresIn: "1h" });
      conn.end(); // Cerrar la conexión al terminar
      res.json({ token });
    } else {
      conn.end(); // Cerrar la conexión al terminar
      res.status(400).json({ error: "Contraseña incorrecta" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Obtener perfil de usuario
const getProfile = async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, "secretKey");
    const { id } = decoded;

    const conn = await getConnection();
    const query = "SELECT * FROM usuarios WHERE id_usuario = ?";
    const results = await conn.query(query, [id]);

    if (results.length === 0) {
      conn.end(); // Cerrar la conexión al terminar
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    conn.end(); // Cerrar la conexión al terminar
    res.json(results[0]);
  } catch (err) {
    console.log(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token invalid" });
    }
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

// Crear cuenta
const crearCuenta = async (req, res) => {
  const { idUsuario, nombreCuenta, banco, tipoCuenta, saldo, meta, red_pago, cci, numerocuenta } = req.body;
  const fechaCreacion = new Date();
  const query = "INSERT INTO cuentas (id_usuario, nombre_cuenta, banco, tipo_cuenta, saldo, meta, fecha_creacion, red_pago, numero_cuenta, cci) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

  try {
    const conn = await getConnection();
    await conn.query(query, [idUsuario, nombreCuenta, banco, tipoCuenta, saldo, meta, fechaCreacion, red_pago, numerocuenta, cci]);
    conn.end(); // Cerrar la conexión al terminar
    res.json({ Status: "Cuenta Creada" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al crear la cuenta" });
  }
};

// Crear tarjeta
const crearTarjeta = async (req, res) => {
  const { idTarjeta, idUsuario, idcategoria, nombreTarjeta, limiteCredito, ultimo_dia_pago, red_pago, ultidigitos, saldoGastado, fecha } = req.body;

  const queryTarjeta = `
    INSERT INTO tarjetas 
    (id_tarjeta, id_usuario, id_categoria, nombre_tarjeta, limite_credito, ultimo_dia_pago, red_pago, ulti_digitos) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const queryMovimiento = `
    INSERT INTO movimientos 
    (id_tarjeta, id_categoria, tipo_movimiento, monto, descripcion, fecha_movimiento) 
    VALUES (?, ?, 'Gasto', ?, 'Consumo Inicial', ?);
  `;

  const conn = await getConnection();

  try {
    await conn.beginTransaction();
    await conn.query(queryTarjeta, [idTarjeta, idUsuario, idcategoria, nombreTarjeta, limiteCredito, ultimo_dia_pago, red_pago, ultidigitos]);
    await conn.query(queryMovimiento, [idTarjeta, 71, saldoGastado, fecha]);
    await conn.commit();
    conn.end(); // Cerrar la conexión al terminar
    res.json({ Status: "Tarjeta y movimiento creados" });
  } catch (err) {
    await conn.rollback();
    console.error('Error al crear la tarjeta o el movimiento:', err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al crear la tarjeta o el movimiento" });
  }
};

// Crear movimiento
const crearMovimiento = async (req, res) => {
  const { idCuenta, idTarjeta, idCategoria, tipoMovimiento, monto, descripcion } = req.body;
  const fechaMovimiento = new Date();
  const query = "INSERT INTO movimientos (id_cuenta, id_tarjeta, id_categoria, tipo_movimiento, monto, descripcion, fecha_movimiento) VALUES (?, ?, ?, ?, ?, ?, ?);";

  try {
    const conn = await getConnection();
    await conn.query(query, [idCuenta || null, idTarjeta || null, idCategoria, tipoMovimiento, monto, descripcion, fechaMovimiento]);
    conn.end(); // Cerrar la conexión al terminar
    res.json({ Status: "Movimiento Creado" });
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al crear el movimiento" });
  }
};

// Crear meta
const crearMeta = async (req, res) => {
  const { idCuenta, objetivo, fechaLimite } = req.body;
  const query = "INSERT INTO metas (id_cuenta, objetivo, fecha_limite) VALUES (?, ?, ?);";

  try {
    const conn = await getConnection();
    await conn.query(query, [idCuenta, objetivo, fechaLimite]);
    conn.end(); // Cerrar la conexión al terminar
    res.json({ Status: "Meta Creada" });
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al crear la meta" });
  }
};

// Obtener tarjetas
const obtenerTarjetas = async (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) {
    return res.status(400).json({ error: "Se requiere el id_usuario" });
  }
  const query = "SELECT tarjetas.*, categoria_tarjeta.categoria FROM tarjetas JOIN categoria_tarjeta ON tarjetas.id_categoria = categoria_tarjeta.id_categoria WHERE tarjetas.id_usuario = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [id_usuario]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener las tarjetas" });
  }
};

// Obtener tarjeta por cuenta
const obtenerTarjetaCuenta = async (req, res) => {
  const { id_cuenta } = req.body;
  if (!id_cuenta) {
    return res.status(400).json({ error: "Se requiere el id_cuenta" });
  }
  const query = "SELECT * FROM tarjetas WHERE id_cuenta = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [id_cuenta]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener la tarjeta" });
  }
};

// Obtener tarjeta
const obtenerTarjeta = async (req, res) => {
  const { id_tarjeta } = req.body;
  if (!id_tarjeta) {
    return res.status(400).json({ error: "Se requiere el id_tarjeta" });
  }
  const query = "SELECT tarjetas.*, categoria_tarjeta.categoria FROM tarjetas JOIN categoria_tarjeta ON tarjetas.id_categoria = categoria_tarjeta.id_categoria WHERE tarjetas.id_tarjeta = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [id_tarjeta]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener la tarjeta" });
  }
};

// Obtener cuentas
const obtenerCuentas = async (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) {
    return res.status(400).json({ error: "Se requiere el id_usuario" });
  }
  const query = "SELECT * FROM cuentas WHERE id_usuario = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [id_usuario]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener las cuentas" });
  }
};

// Obtener cuenta
const obtenerCuenta = async (req, res) => {
  const { id_cuenta } = req.body;
  if (!id_cuenta) {
    return res.status(400).json({ error: "Se requiere el id_cuenta" });
  }
  const query = "SELECT * FROM cuentas WHERE id_cuenta = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [id_cuenta]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener la cuenta" });
  }
};

// Obtener movimientos de cuenta
const obtenerMovimientosCuenta = async (req, res) => {
  const { idCuenta } = req.params;
  const query = "SELECT movimientos.*, categoria_movimiento.categoria FROM movimientos JOIN categoria_movimiento ON movimientos.id_categoria = categoria_movimiento.id_categoria WHERE movimientos.id_cuenta = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [idCuenta]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener los movimientos de la cuenta" });
  }
};

// Obtener movimientos de tarjeta
const obtenerMovimientosTarjeta = async (req, res) => {
  const { idTarjeta } = req.params;
  const query = "SELECT movimientos.*, categoria_movimiento.categoria FROM movimientos JOIN categoria_movimiento ON movimientos.id_categoria = categoria_movimiento.id_categoria WHERE movimientos.id_tarjeta = ?";

  try {
    const conn = await getConnection();
    const rows = await conn.query(query, [idTarjeta]);
    conn.end(); // Cerrar la conexión al terminar
    res.json(rows);
  } catch (err) {
    console.log(err);
    conn.end(); // Cerrar la conexión al terminar
    res.status(500).json({ error: "Error al obtener los movimientos de la tarjeta" });
  }
};

module.exports = {
  crearUsuario,
  loginUsuario,
  getProfile,
  crearCuenta,
  crearTarjeta,
  crearMovimiento,
  crearMeta,
  obtenerTarjetas,
  obtenerTarjeta,
  obtenerTarjetaCuenta,
  obtenerCuentas,
  obtenerCuenta,
  obtenerMovimientosCuenta,
  obtenerMovimientosTarjeta,
};
