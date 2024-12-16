// consultas.js
const format = require("pg-format");

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "H6via3xs",
  database: "joyas",
  allowExitOnIdle: true, // esta propiedad le dice a PostgeSQL que cierre la conexión luego de cada consulta
});

const agregarJoyas = async (nombre, categoria, metal, precio, stock) => {
  try {
    const consulta =
      "INSERT INTO inventario values (DEFAULT, $1, $2, $3, $4, $5)";
    const values = [nombre, categoria, metal, precio, stock];
    await pool.query(consulta, values);
    console.log("Joya agregada");
  } catch (error) {
    console.error("Error al agregar joya:", error);
    throw { code: 500, message: "Error interno del servidor" };
  }
};

const obtenerJoyas = async ({ limits = 3, order_by = "id_ASC", page = 0 }) => {
  try {
    const [campo, direccion] = order_by.split("_");
    const offset = page * limits;

    const formattedQuery = format(
      "SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s",
      campo,
      direccion,
      limits,
      offset
    );

    const { rows: inventario } = await pool.query(formattedQuery);
    return inventario;
  } catch (error) {
    console.error("Error al obtener joyas:", error);
    throw { code: 500, message: "Error interno del servidor" };
  }
};

// obtener Joyas pero ahora parametrizado y de forma segura

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  try {
    let filtros = [];
    const values = [];

    const agregarFiltro = (campo, comparador, valor) => {
      values.push(valor);
      const { length } = filtros;
      filtros.push(`${campo} ${comparador} $${length + 1}`);
    };

    if (precio_max) agregarFiltro("precio", "<=", precio_max);
    if (precio_min) agregarFiltro("precio", ">=", precio_min);
    if (categoria) agregarFiltro("categoria", "=", categoria);
    if (metal) agregarFiltro("metal", "=", metal);

    let consulta = "SELECT * FROM inventario";

    if (filtros.length > 0) {
      filtros = filtros.join(" AND ");
      consulta += ` WHERE ${filtros}`;
    }

    const { rows: inventario } = await pool.query(consulta, values);
    return inventario;
  } catch (error) {
    console.error("Error al obtener joyas por filtros:", error);
    throw { code: 500, message: "Error al filtrar joyas en la base de datos" };
  }
};

// obtener una joya por ID

const obtenerJoya = async (id) => {
  try {
    const consulta = "SELECT * FROM inventario WHERE id = $1";
    const values = [id];
    const { rows } = await pool.query(consulta, values);
    if (rows.length === 0) {
      throw { code: 404, message: "Joya no encontrada" };
    }
    return rows[0];
  } catch (error) {
    console.error("Error al obtener joya:", error);
    throw { code: 500, message: "Error al obtener joya de la base de datos" };
  }
};

const modificarJoyas = async (nombre, categoria, metal, precio, stock, id) => {
  try {
    const consulta =
      "UPDATE inventario SET nombre = $1, categoria = $2, metal = $3, precio = $4, stock = $5 WHERE id = $6";
    const values = [nombre, categoria, metal, precio, stock, id];
    const { rowCount } = await pool.query(consulta, values);
    if (rowCount === 0) {
      throw { code: 404, message: "No se encontró la joya con ese ID" };
    }
  } catch (error) {
    console.error("Error al modificar joya:", error);
    throw { code: 500, message: "Error al modificar joya en la base de datos" };
  }
};

const eliminarJoya = async (id) => {
  try {
    const consulta = "DELETE FROM inventario WHERE id = $1";
    const values = [id];
    const { rowCount } = await pool.query(consulta, values);
    if (rowCount === 0) {
      throw { code: 404, message: "No se encontró la joya con ese ID" };
    }
  } catch (error) {
    console.error("Error al eliminar joya:", error);
    throw { code: 500, message: "Error al eliminar joya de la base de datos" };
  }
};

// HATEOAS es algo como para llamar solo algunas partes de un código
const prepararHATEOAS = (inventario) => {
  const results = inventario
    .map((m) => {
      return {
        name: m.nombre,
        href: `/inventario/inventario/${m.id}`,
      };
    })
    .slice(0, 4);
  const total = inventario.length;
  const HATEOAS = {
    total,
    results,
  };
  return HATEOAS;
};

module.exports = {
  agregarJoyas,
  obtenerJoyas,
  obtenerJoya,
  obtenerJoyasPorFiltros,
  modificarJoyas,
  eliminarJoya,
  prepararHATEOAS,
};
