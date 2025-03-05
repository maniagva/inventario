require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const rolRoutes = require('./routes/rolRoutes');
const reportRoutes = require('./routes/reportRoutes');
const configRoutes = require('./routes/configRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Usar rutas
console.log('Registrando rutas...');
app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth registrada');
app.use('/api/productos', productoRoutes);
console.log('Ruta /api/productos registrada');
app.use('/api/movimientos', movimientoRoutes);
console.log('Ruta /api/movimientos registrada');
app.use('/api/inventario', inventarioRoutes);
console.log('Ruta /api/inventario registrada');
app.use('/api/empleados', empleadoRoutes);
console.log('Ruta /api/empleados registrada');
app.use('/api/proveedores', proveedorRoutes);
console.log('Ruta /api/proveedores registrada');
app.use('/api/categorias', categoriaRoutes);
console.log('Ruta /api/categorias registrada');
app.use('/api/ubicaciones', ubicacionRoutes);
console.log('Ruta /api/ubicaciones registrada');
app.use('/api/roles', rolRoutes);
console.log('Ruta /api/roles registrada');
app.use('/api/reportes', reportRoutes);
console.log('Ruta /api/reportes registrada');
app.use('/api/config', configRoutes);
console.log('Ruta /api/config registrada');
app.use('/api/dashboard', dashboardRoutes);
console.log('Ruta /api/dashboard registrada');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Manejador de errores 404
app.use((req, res, next) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;