-- ============================================================
--  Base de datos: acme  (Compañía ACME)
--  Motor: MySQL 5.7+ / 8.x
--
--  Ejecutar:  mysql -u root -p < Backend/database/acme.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS acme
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE acme;

-- ------------------------------------------------------------
--  Tabla: usuarios  (autenticación / login)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL
);

-- Usuario de prueba.
--   email:    admin@acme.cl
--   password: admin123   (almacenada como hash bcrypt)
INSERT INTO usuarios (nombre, email, password) VALUES
  ('Administrador ACME', 'admin@acme.cl',
   '$2a$10$C4kDhrW98AM5CqWTrRQRTeETEChbPKAznGggPvYfjarnIEdP.ew.G');

-- ------------------------------------------------------------
--  Tabla: productos  (catálogo)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
  productId    INT AUTO_INCREMENT PRIMARY KEY,
  productName  VARCHAR(150) NOT NULL,
  productCode  VARCHAR(50)  NOT NULL,
  releaseDate  DATE,
  price        INT,
  description  TEXT,
  starRating   INT DEFAULT 0,
  image        VARCHAR(255) DEFAULT 'sinimage.png'
);

-- Productos de ejemplo (las imágenes existen en Frontend/public).
INSERT INTO productos
  (productName, productCode, releaseDate, price, description, starRating, image)
VALUES
  ('Auriculares Noise Cancelling', 'PROD001', '2024-01-15', 89990,
   'Auriculares inalámbricos con cancelación activa de ruido', 180,
   'Auriculares Noise Cancelling.png'),
  ('Reloj Inteligente Fit', 'PROD002', '2024-02-10', 64990,
   'Smartwatch con monitor de actividad física y ritmo cardíaco', 160,
   'Reloj Inteligente Fit.png'),
  ('Smartphone Galaxy Z', 'PROD003', '2024-03-05', 799990,
   'Smartphone plegable de última generación', 200,
   'Smartphone Galaxy Z.png'),
  ('Mochila Impermeable', 'PROD004', '2024-01-28', 34990,
   'Mochila resistente al agua con compartimento para notebook', 140,
   'Mochila Impermeable.png'),
  ('Zapatilla de Lona', 'PROD005', '2024-02-20', 24990,
   'Zapatilla urbana de lona, cómoda y liviana', 120,
   'zapatilla de lona.png');
