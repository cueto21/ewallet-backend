const express = require("express");
const app = express();
const apiRoutes = require("./routes/routes");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());
app.use("/api", apiRoutes);
app.use(errorHandler);  // Uso del middleware de manejo de errores

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
