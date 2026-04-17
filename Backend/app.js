// Require
var express= require('express');

// Inicializar variables
var app= express();

// Ejecutar peticiones

app.listen(3000, ()=>{
    console.log('Express Server - Puerto 3000 Online');
})

app.get('/', (req, res, next) =>{
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
});