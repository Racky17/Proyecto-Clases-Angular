// Require
var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
var cors = require("cors");

// Inicializar variables
var app = express();

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Usar CORS Middleware
app.use(cors());

// Conexion a la base de datos
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "acme",
});

//conectar a la base de datos
conn.connect();

// Ejecutar peticiones

app.listen(3000, () => {
  console.log("Express Server - Puerto 3000 Online");
});

app.get("/productos", (req, res) => {
  const sql = "SELECT * FROM productos";
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.status(200).json({
      ok: true,
      productos: results,
    });
  });
});

// Rutas
app.get("/", (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente",
  });
});

// Añadir un nuevo producto a la BD
app.post("/productos", (req, res) => {
  const { name, code, date, price, description, rate, image } = req.body;

  const sql = `INSERT INTO productos 
        (productName, productCode, releaseDate, price, description, starRating, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

  conn.query(
    sql,
    [name, code, date, parseInt(price), description, parseInt(rate), image],
    (err, result) => {
      if (err) throw err;

      res.status(201).json({
        ok: true,
        mensaje: "Producto añadido correctamente",
      });
    },
  );
});

app.put("/upload/productos/:id", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado ningún archivo",
    });
  }

  const file = req.files.image;
  const fileExtension = file.name.split(".").pop().toLowerCase();
  const allowedExtensions = ["png", "jpg", "jpeg", "gif"];

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de extensión no permitido",
    });
  }
});

// Elimina un producto específico desde la BD
app.delete("/productos/:id", (req, res) => {
  const sql = "DELETE FROM productos WHERE productId = ?";
  conn.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    res.status(200).json({
      ok: true,
      mensaje: "Producto eliminado correctamente",
    });
  });
});

// Actualiza un producto específico en la BD
app.put("/productos/:id", (req, res) => {
  const { name, code, date, price, description, rate } = req.body;
  const sql = `UPDATE productos SET productName = ?, productCode = ?, releaseDate = ?, price = ?, 
    description = ?, starRating = ? WHERE productId = ?`;

  conn.query(
    sql,
    [
      name,
      code,
      date,
      parseInt(price),
      description,
      parseInt(rate),
      req.params.id,
    ],
    (err, result) => {
      if (err) throw err;
      res.status(200).json({
        ok: true,
        mensaje: "Producto actualizado correctamente",
      });
    },
  );
});
