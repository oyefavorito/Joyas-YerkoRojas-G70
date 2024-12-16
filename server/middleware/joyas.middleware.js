const fs = require("fs");
const path = require("path");

// Define el middleware para registrar actividad
const registrarActividad = (req, res, next) => {
  const { method, originalUrl, body, query, params } = req;

  // Estructura del log
  const actividad = {
    metodo: method,
    ruta: originalUrl,
    cuerpo: body,
    parametros: params,
    consulta: query,
    fecha: new Date().toISOString(),
  };

  // Log en la consola
  console.log("Registro de actividad:", actividad);

  // Continuar con la siguiente función o controlador
  next();
};

module.exports = registrarActividad;
