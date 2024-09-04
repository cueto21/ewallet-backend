const mysqlConnection = require("../database/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Crear usuario
const crearUsuario = (req, res) => {
  const { nombre, email, contrasena } = req.body;
  const fechaRegistro = new Date();

  // Hash the password
  const hashedPassword = bcrypt.hashSync(contrasena, 10);

  const query = `INSERT INTO usuarios (nombre, email, contrasena, fecha_registro) VALUES (?, ?, ?, ?);`;

  mysqlConnection.query(query, [nombre, email, hashedPassword, fechaRegistro], (err, results) => {
    if (!err) {
      res.json({ Status: "Usuario Registrado" });
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al registrar el usuario" });
    }
  });
};

const loginUsuario = (req, res) => {
  const { email, contrasena } = req.body;

  const query = "SELECT * FROM usuarios WHERE email = ?";

  mysqlConnection.query(query, [email], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Error en el servidor" });
    } else if (results.length === 0) {
      res.status(400).json({ error: "Usuario no encontrado" });
    } else {
      const user = results[0];
      
      // Check if password matches
      if (bcrypt.compareSync(contrasena, user.contrasena)) {
        // Create JWT token
        const token = jwt.sign({ id: user.id_usuario }, "secretKey", { expiresIn: "1h" });
        res.json({ token });
      } else {
        res.status(400).json({ error: "Contraseña incorrecta" });
      }
    }
  });
};

// Crear cuenta
const crearCuenta = (req, res) => {
  const { idUsuario, nombreCuenta, banco, tipoCuenta, saldo, meta, red_pago, cci, numerocuenta } = req.body;
  const fechaCreacion = new Date();
  const query = "INSERT INTO cuentas (id_usuario, nombre_cuenta, banco, tipo_cuenta, saldo, meta, fecha_creacion, red_pago, numero_cuenta, cci) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

  mysqlConnection.query(query, [idUsuario, nombreCuenta, banco, tipoCuenta, saldo, meta, fechaCreacion, red_pago, numerocuenta, cci], (err, results) => {
    if (!err) {
      res.json({ Status: "Cuenta Creada" });
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al crear la cuenta" });
    }
  });
};

const getProfile = (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token invalid" });
    }

    const query = "SELECT * FROM usuarios WHERE id_usuario = ?";
    mysqlConnection.query(query, [decoded.id], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Error al obtener el perfil" });
      } else {
        res.json(results[0]);
      }
    });
  });
};

const crearTarjeta = (req, res) => {
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

  mysqlConnection.beginTransaction(err => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: "Error al iniciar la transacción" });
    }

    mysqlConnection.query(queryTarjeta, [idTarjeta, idUsuario, idcategoria, nombreTarjeta, limiteCredito, ultimo_dia_pago, red_pago, ultidigitos], (err, results) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          console.error('Error al crear la tarjeta:', err);
          res.status(500).json({ error: "Error al crear la tarjeta" });
        });
      }

      mysqlConnection.query(queryMovimiento, [idTarjeta, 71, saldoGastado, fecha], (err, results) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            console.error('Error al crear el movimiento:', err);
            res.status(500).json({ error: "Error al crear el movimiento" });
          });
        }

        mysqlConnection.commit(err => {
          if (err) {
            return mysqlConnection.rollback(() => {
              console.error('Error al finalizar la transacción:', err);
              res.status(500).json({ error: "Error al finalizar la transacción" });
            });
          }

          res.json({ Status: "Tarjeta y movimiento creados" });
        });
      });
    });
  });
};

// Crear movimiento
const crearMovimiento = (req, res) => {
  const { idCuenta, idTarjeta, idCategoria, tipoMovimiento, monto, descripcion } = req.body;
  const fechaMovimiento = new Date();
  const query = "INSERT INTO movimientos (id_cuenta, id_tarjeta, id_categoria, tipo_movimiento, monto, descripcion, fecha_movimiento) VALUES (?, ?, ?, ?, ?, ?, ?);";

  mysqlConnection.query(query, [idCuenta || null, idTarjeta || null, idCategoria, tipoMovimiento, monto, descripcion, fechaMovimiento], (err, results) => {
    if (!err) {
      res.json({ Status: "Movimiento Creado" });
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al crear el movimiento" });
    }
  });
};


// Crear meta
const crearMeta = (req, res) => {
  const { idCuenta, objetivo, fechaLimite } = req.body;
  const query = "INSERT INTO metas (id_cuenta, objetivo, fecha_limite) VALUES (?, ?, ?);";

  mysqlConnection.query(query, [idCuenta, objetivo, fechaLimite], (err, results) => {
    if (!err) {
      res.json({ Status: "Meta Creada" });
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al crear la meta" });
    }
  });
};

// Obtener tarjetas
const obtenerTarjetas = (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) {
    return res.status(400).json({ error: "Se requiere el id_usuario" });
  }
  const query = "SELECT tarjetas.*, categoria_tarjeta.categoria FROM tarjetas JOIN categoria_tarjeta ON tarjetas.id_categoria = categoria_tarjeta.id_categoria WHERE tarjetas.id_usuario = ?";

  mysqlConnection.query(query, [id_usuario], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener las tarjetas" });
    }
  });
};

const obtenerTarjetaCuenta = (req, res) => {
  const { id_cuenta } = req.body;
  if (!id_cuenta) {
    return res.status(400).json({ error: "Se requiere el id_cuenta" });
  }
  const query = "SELECT * FROM tarjetas WHERE id_cuenta = ?";

  mysqlConnection.query(query, [id_cuenta], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener la tarjeta" });
    }
  });
};

const obtenerTarjeta = (req, res) => {
  const { id_tarjeta } = req.body;
  if (!id_tarjeta) {
    return res.status(400).json({ error: "Se requiere el id_tarjeta" });
  }
  const query = "SELECT tarjetas.*, categoria_tarjeta.categoria FROM tarjetas JOIN categoria_tarjeta ON tarjetas.id_categoria = categoria_tarjeta.id_categoria WHERE tarjetas.id_tarjeta = ?";

  mysqlConnection.query(query, [id_tarjeta], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener la tarjeta" });
    }
  });
};

// Obtener cuentas
const obtenerCuentas = (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) {
    return res.status(400).json({ error: "Se requiere el id_usuario" });
  }
  const query = "SELECT * FROM cuentas WHERE id_usuario = ?";

  mysqlConnection.query(query, [id_usuario], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener las cuentas" });
    }
  });
};

const obtenerCuenta = (req, res) => {
  const { id_cuenta } = req.body;
  if (!id_cuenta) {
    return res.status(400).json({ error: "Se requiere el id_cuenta" });
  }
  const query = "SELECT * FROM cuentas WHERE id_cuenta = ?";

  mysqlConnection.query(query, [id_cuenta], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener la cuenta" });
    }
  });
};


// Obtener movimientos de cuenta
const obtenerMovimientosCuenta = (req, res) => {
  const { idCuenta } = req.params;
  const query = "SELECT movimientos.*, categoria_movimiento.categoria FROM movimientos JOIN categoria_movimiento ON movimientos.id_categoria = categoria_movimiento.id_categoria WHERE movimientos.id_cuenta = ?";

  mysqlConnection.query(query, [idCuenta], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener los movimientos de la cuenta" });
    }
  });
};

// Obtener movimientos de tarjeta
const obtenerMovimientosTarjeta = (req, res) => {
  const { idTarjeta } = req.params;
  const query = "SELECT movimientos.*, categoria_movimiento.categoria FROM movimientos JOIN categoria_movimiento ON movimientos.id_categoria = categoria_movimiento.id_categoria WHERE movimientos.id_tarjeta = ?";

  mysqlConnection.query(query, [idTarjeta], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: "Error al obtener los movimientos de la tarjeta" });
    }
  });
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
