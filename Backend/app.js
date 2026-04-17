// Require
var express = require('express');
var mysql = require('mysql');

// Inicializar variables
var app = express();

// Conexion a la base de datos
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'acme'
});

//conectar a la base de datos
conn.connect();

// Ejecutar peticiones

app.listen(3000, ()=>{
    console.log('Express Server - Puerto 3000 Online');
})

app.get('/productos', (req, res) =>{
    const sql ='SELECT * FROM productos';
    conn.query(sql, (err, results) =>{
        if (err) throw err;
        res.status(200).json({
            ok: true,
            productos: results
        })
    })
})

// Rutas
app.get('/', (req, res, next) =>{
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
});