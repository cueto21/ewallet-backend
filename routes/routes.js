const express = require("express");
const router = express.Router();
const cors = require("cors");
const { 
  crearUsuario, 
  loginUsuario, 
  getProfile, 
  crearCuenta, 
  crearTarjeta, 
  crearMovimiento, 
  crearMeta, 
  obtenerTarjetas, 
  obtenerCuentas,
  obtenerCuenta, 
  obtenerMovimientosCuenta, 
  obtenerMovimientosTarjeta, 
  obtenerTarjeta, 
  obtenerTarjetaCuenta 
} = require("../controllers/apiController");

// Configuración de CORS
const corsOptions = {
  origin: 'https://www.saldopersonal.com', // Permitir solicitudes desde este dominio
  methods: ['GET', 'POST'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

// Middleware para manejar CORS con configuración
router.use(cors(corsOptions));

// Rutas POST
router.post("/usuario/registrar", crearUsuario);
router.post("/usuario/login", loginUsuario);
router.get("/usuario/profile", getProfile);
router.post("/cuenta/crear", crearCuenta);
router.post("/tarjeta/crear", crearTarjeta);
router.post("/movimiento/crear", crearMovimiento);
router.post("/meta/crear", crearMeta);

// Rutas GET
router.post("/tarjetas", obtenerTarjetas);
router.post("/tarjetaCuenta", obtenerTarjetaCuenta);
router.post("/tarjeta", obtenerTarjeta);
router.post("/cuentas", obtenerCuentas);
router.post("/cuenta", obtenerCuenta);
router.get("/movimientos/:idCuenta", obtenerMovimientosCuenta);
router.get("/movimientos/tarjeta/:idTarjeta", obtenerMovimientosTarjeta);

module.exports = router;
