const {
  agregarJoyas,
  obtenerJoyas,
  obtenerJoyasPorFiltros,
  modificarJoyas,
  eliminarJoya,
  prepararHATEOAS,
} = require("./consultas.js");

const express = require("express");

const PORT = 3000;

const app = express();
app.use(express.json());

const registrarActividad = require("./server/middleware/joyas.middleware.js");
app.use(registrarActividad);

// INCLUIR EL HATEOAS

app.get("/joyas", async (req, res) => {
  try {
    const queryStrings = req.query;
    const inventario = await obtenerJoyas(queryStrings);
    const HATEOAS = prepararHATEOAS(inventario);
    res.json(HATEOAS);
  } catch (error) {
    const { code = 500, message = "Error interno del servidor" } = error;
    res.status(code).json({ error: message });
  }
});

// aquí voy a obtener las joyas filtradss
app.get("/joyas/filtros", async (req, res) => {
  try {
    const queryStrings = req.query;
    const inventario = await obtenerJoyasPorFiltros(queryStrings);
    res.json(inventario);
  } catch (error) {
    const { code = 500, message = "Error interno del servidor" } = error;
    res.status(code).json({ error: message });
  }
});

app.post("/joyas", async (req, res) => {
  try {
    const { nombre, categoria, metal, precio, stock } = req.body;
    await agregarJoyas(nombre, categoria, metal, precio, stock);
    res.send("Joya agregada con éxito");
  } catch (error) {
    const { code } = error;
    if (code == "23502") {
      res
        .status(400)
        .send(
          "Se ha violado la restricción NOT NULL en uno de los campos de la tabla"
        );
    } else {
      res.status(500).send(error);
    }
  }
});

app.put("/joyas/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, metal, precio, stock } = req.body;
  try {
    await modificarJoyas(nombre, categoria, metal, precio, stock, id);
    res.send("Joya modificada con éxito");
  } catch ({ code, message }) {
    res.status(code).send(message);
  }
});

app.delete("/joyas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarJoya(id);
    res.send("Joya eliminada con éxito");
  } catch (error) {
    const { code = 500, message = "Error interno del servidor" } = error;
    res.status(code).json({ error: message });
  }
});

// esta es mi ruta por si escriben mal la ruta (es lo mismo pero no es igual jjj)
app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.listen(3000, console.log(`Servidor activo http://localhost:${PORT}`));
