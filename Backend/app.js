// ============================================================
//  Servidor Backend - Compañía ACME
//  Express + MySQL + JWT
// ============================================================
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");

// ---------- Inicialización ----------
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "acme-secret-key";

// Cliente para verificar los ID tokens de Google (Login con Google).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Genera un JWT propio para un usuario ya autenticado.
function emitirToken(usuario) {
  return jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
    expiresIn: "8h",
  });
}

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// ---------- Conexión a la base de datos (pool) ----------
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "acme",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Verificar la conexión al iniciar.
pool.getConnection((err, connection) => {
  if (err) {
    console.error("✖ Error al conectar con MySQL:", err.message);
    return;
  }
  console.log("✔ Conexión a MySQL (base de datos 'acme') establecida");
  connection.release();
});

// ============================================================
//  Middleware de autenticación (verifica el token JWT)
// ============================================================
function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Token no proporcionado",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token inválido o expirado",
      });
    }
    req.usuario = decoded;
    next();
  });
}

// ============================================================
//  Rutas públicas
// ============================================================
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "API Compañía ACME en funcionamiento",
  });
});

// Login: valida credenciales y devuelve un token JWT.
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: "Email y password son obligatorios",
    });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  pool.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
    }

    const usuario = results[0];
    const passwordValido = bcrypt.compareSync(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
    }

    const token = emitirToken(usuario);

    res.status(200).json({
      ok: true,
      mensaje: "Login correcto",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
      },
    });
  });
});

// Login con Google: verifica el ID token y devuelve nuestro propio JWT.
app.post("/auth/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ ok: false, mensaje: "Falta la credencial de Google" });
  }
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({
      ok: false,
      mensaje: "GOOGLE_CLIENT_ID no está configurado en el servidor",
    });
  }

  try {
    // Verifica la firma del ID token contra el Client ID de la app.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.name || email;

    // Busca el usuario; si no existe, lo crea (sin password utilizable).
    pool.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
      if (err) {
        return res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
      }

      const responder = (usuario) =>
        res.status(200).json({
          ok: true,
          mensaje: "Login con Google correcto",
          token: emitirToken(usuario),
          usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
        });

      if (results.length > 0) {
        return responder(results[0]);
      }

      pool.query(
        "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
        [nombre, email, "GOOGLE_OAUTH"],
        (insErr, result) => {
          if (insErr) {
            return res.status(500).json({ ok: false, mensaje: "Error al crear el usuario" });
          }
          responder({ id: result.insertId, email, nombre });
        },
      );
    });
  } catch (e) {
    return res.status(401).json({ ok: false, mensaje: "Credencial de Google inválida" });
  }
});

// ============================================================
//  Rutas protegidas (requieren token)
// ============================================================

// Obtener todos los productos.
app.get("/productos", verificarToken, (req, res) => {
  const sql = "SELECT * FROM productos";
  pool.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: "Error al obtener productos" });
    }
    res.status(200).json({ ok: true, productos: results });
  });
});

// Añadir un nuevo producto.
app.post("/productos", verificarToken, (req, res) => {
  const { name, code, date, price, description, rate, image } = req.body;

  const sql = `INSERT INTO productos
        (productName, productCode, releaseDate, price, description, starRating, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

  pool.query(
    sql,
    [name, code, date, parseInt(price), description, parseInt(rate), image || "sinimage.png"],
    (err, result) => {
      if (err) {
        return res.status(500).json({ ok: false, mensaje: "Error al crear el producto" });
      }
      res.status(201).json({
        ok: true,
        mensaje: "Producto añadido correctamente",
        id: result.insertId,
      });
    },
  );
});

// Actualizar un producto existente.
app.put("/productos/:id", verificarToken, (req, res) => {
  const { name, code, date, price, description, rate } = req.body;
  const sql = `UPDATE productos SET productName = ?, productCode = ?, releaseDate = ?, price = ?,
    description = ?, starRating = ? WHERE productId = ?`;

  pool.query(
    sql,
    [name, code, date, parseInt(price), description, parseInt(rate), req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ ok: false, mensaje: "Error al actualizar el producto" });
      }
      res.status(200).json({ ok: true, mensaje: "Producto actualizado correctamente" });
    },
  );
});

// Eliminar un producto.
app.delete("/productos/:id", verificarToken, (req, res) => {
  const sql = "DELETE FROM productos WHERE productId = ?";
  pool.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: "Error al eliminar el producto" });
    }
    res.status(200).json({ ok: true, mensaje: "Producto eliminado correctamente" });
  });
});

// Subir la imagen de un producto.
app.put("/upload/productos/:id", verificarToken, (req, res) => {
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

  const fileName = `${req.params.id}.${fileExtension}`;
  const uploadPath = path.join(__dirname, "uploads", fileName);

  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: "Error al guardar el archivo" });
    }

    const sql = "UPDATE productos SET image = ? WHERE productId = ?";
    pool.query(sql, [fileName, req.params.id], (dbErr) => {
      if (dbErr) {
        return res.status(500).json({ ok: false, mensaje: "Error al actualizar la imagen" });
      }
      res.status(200).json({
        ok: true,
        mensaje: "Imagen subida correctamente",
        archivo: fileName,
      });
    });
  });
});

// ============================================================
//  Arranque del servidor
// ============================================================
app.listen(PORT, () => {
  console.log(`✔ Express Server - Puerto ${PORT} Online`);
});
