const express = require("express");
const router = express.Router();
const cors = require("cors");
const { crearUsuario, loginUsuario, getProfile, crearCuenta, crearTarjeta, crearMovimiento, crearMeta, obtenerTarjetas, obtenerCuentas,obtenerCuenta , obtenerMovimientosCuenta, obtenerMovimientosTarjeta, obtenerTarjeta, obtenerTarjetaCuenta } = require("../controllers/apiController");

// Middleware para manejar CORS
router.use(cors());

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