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
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// ---------- Inicialización ----------
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "acme-secret-key";

// URL del frontend (usada para armar el enlace de recuperación de contraseña).
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";

// Cliente para verificar los ID tokens de Google (Login con Google).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ============================================================
//  Envío de Email — Nodemailer + Gmail (OAuth2)
// ============================================================
// Credenciales obtenidas desde las variables de ambiente. Se generan en
// Google Cloud (Gmail API + ID de cliente OAuth) y en el OAuth 2.0 Playground.
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const EMAIL_REDIRECT_URI = process.env.EMAIL_REDIRECT_URI;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

// Cliente de autenticación OAuth para interactuar con el servicio de Google.
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(EMAIL_CLIENT_ID, EMAIL_CLIENT_SECRET, EMAIL_REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: EMAIL_REFRESH_TOKEN });

// Crea un objeto Transport con todas las credenciales de autorización para
// hacer uso del servicio de Gmail. Obtiene un access token fresco a partir
// del refresh token en cada envío.
async function crearTransportEmail() {
  const accessToken = await oauth2Client.getAccessToken();
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_USER,
      clientId: EMAIL_CLIENT_ID,
      clientSecret: EMAIL_CLIENT_SECRET,
      refreshToken: EMAIL_REFRESH_TOKEN,
      accessToken: accessToken?.token || accessToken,
    },
  });
}

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
//  Envío de Email de Prueba  (POST /email-test)
// ============================================================
app.post("/email-test", async (req, res) => {
  let msg = `<h3>
                <span style="background-color: #ffcc00;">
                    Envío de Email con NodeJS - Nodemailer y GMail
                </span>
            </h3>
            <p>Este es un <strong> email de ejemplo </strong> utilizando
                <span style="color: #ff0000;">Nodemailer</span> y <em>NodeJS</em>.
            </p>
            <ul>
                <li>Permite formato HTML</li>
                <li>Permite adjuntar archivos</li>
                <li>Se utiliza una cuenta GMail configurada con OAuth2</li>
            </ul>`;

  // Recibimos la dirección de email desde el body.
  const { email_adress } = req.body;

  if (!email_adress) {
    return res.status(400).json({ ok: false, mensaje: "Falta la dirección de email (email_adress)" });
  }

  // Objeto JSON con todos los datos relativos al email que queremos enviar.
  const mailOptions = {
    from: `Asignatura Angular <${EMAIL_USER}>`,
    to: email_adress,
    subject: "Email de ejemplo con Nodemailer",
    generateTextFromHTML: true,
    html: msg,
  };

  try {
    const smtpTransport = await crearTransportEmail();
    // Realizamos el envío mediante la función sendMail().
    smtpTransport.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ ok: false, mensaje: "Error al enviar el email" });
      }
      console.log(response);
      smtpTransport.close();
      res.status(200).json({
        ok: true,
        mensaje: "Email enviado correctamente",
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ ok: false, mensaje: "Error al configurar el transporte de email" });
  }
});

// ============================================================
//  Desafío: Recuperación de contraseña
// ============================================================

// Paso 1: el usuario solicita recuperar su contraseña indicando su email.
// El servidor genera un token temporal (JWT, expira en 15 min) y envía un
// correo con un enlace dinámico hacia el frontend.
app.post("/recuperar-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ ok: false, mensaje: "El email es obligatorio" });
  }

  pool.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
    }

    // Respuesta genérica para no revelar si el correo existe (evita enumeración).
    const respuestaGenerica = () =>
      res.status(200).json({
        ok: true,
        mensaje: "Si el correo está registrado, recibirás un enlace de recuperación.",
      });

    if (results.length === 0) {
      return respuestaGenerica();
    }

    const usuario = results[0];

    // Token temporal firmado, con propósito específico y expiración corta.
    const tokenReset = jwt.sign(
      { id: usuario.id, email: usuario.email, purpose: "reset" },
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    const enlace = `${FRONTEND_URL}/reset-password?token=${tokenReset}`;

    const html = `<h3>Recuperación de contraseña — Compañía ACME</h3>
      <p>Hola ${usuario.nombre || ""},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el
         siguiente enlace (válido por <strong>15 minutos</strong>):</p>
      <p><a href="${enlace}" style="background-color:#0d6efd;color:#fff;padding:10px 18px;
         text-decoration:none;border-radius:4px;display:inline-block;">Restablecer contraseña</a></p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <hr>
      <small>Si el botón no funciona, copia y pega esta URL en tu navegador:<br>${enlace}</small>`;

    const mailOptions = {
      from: `Compañía ACME <${EMAIL_USER}>`,
      to: usuario.email,
      subject: "Recuperación de contraseña",
      generateTextFromHTML: true,
      html,
    };

    try {
      const smtpTransport = await crearTransportEmail();
      smtpTransport.sendMail(mailOptions, (mailErr) => {
        smtpTransport.close();
        if (mailErr) {
          console.log(mailErr);
          return res.status(500).json({ ok: false, mensaje: "No se pudo enviar el correo" });
        }
        respuestaGenerica();
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ ok: false, mensaje: "Error al configurar el transporte de email" });
    }
  });
});

// Paso 2: el usuario envía el token recibido y su nueva contraseña.
// El servidor verifica el token y actualiza la contraseña (hash bcrypt).
app.post("/reset-password", (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ ok: false, mensaje: "Token y nueva contraseña son obligatorios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, mensaje: "La contraseña debe tener al menos 6 caracteres" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ ok: false, mensaje: "El enlace es inválido o ha expirado" });
  }

  if (decoded.purpose !== "reset") {
    return res.status(401).json({ ok: false, mensaje: "Token no válido para esta operación" });
  }

  const hash = bcrypt.hashSync(password, 10);
  pool.query(
    "UPDATE usuarios SET password = ? WHERE id = ?",
    [hash, decoded.id],
    (err) => {
      if (err) {
        return res.status(500).json({ ok: false, mensaje: "Error al actualizar la contraseña" });
      }
      res.status(200).json({ ok: true, mensaje: "Contraseña actualizada correctamente" });
    },
  );
});

// ============================================================
//  Arranque del servidor
// ============================================================
app.listen(PORT, () => {
  console.log(`✔ Express Server - Puerto ${PORT} Online`);
});
