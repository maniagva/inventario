const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '75103837',
    database: 'inventario_seguridad',
    port: 3305
});

function connectDB() {
    db.connect(err => {
        if (err) {
            console.error('Error conectando a MySQL:', err);
            console.log('Reintentando conexión en 5 segundos...');
            setTimeout(connectDB, 5000);
            return;
        }
        console.log('Conectado a MySQL');
    });
}
connectDB();

db.on('error', err => {
    console.error('Error en la conexión a MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') connectDB();
    else throw err;
});

module.exports = db;