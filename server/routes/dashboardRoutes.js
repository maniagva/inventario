const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Auditor' && req.user.rol !== 'Supervisor') {
        return res.status(403).json({ message: 'No tienes permiso para ver el dashboard' });
    }
    const queries = {
        totalProductos: 'SELECT COUNT(*) as count FROM Productos',
        movimientosHoy: 'SELECT COUNT(*) as count FROM Movimientos_Inventario WHERE DATE(fecha) = CURDATE()',
        stockCritico: 'SELECT COUNT(*) as count FROM Inventario_Actual WHERE stock_actual < 5',
        stockPorCategoria: `
            SELECT c.nombre as categoria, SUM(ia.stock_actual) as stock
            FROM Inventario_Actual ia
            JOIN Productos p ON ia.id_producto = p.id_producto
            JOIN Categorias c ON p.id_categoria = c.id_categoria
            GROUP BY c.id_categoria, c.nombre
        `
    };

    Promise.all([
        new Promise((resolve, reject) => db.query(queries.totalProductos, (err, results) => err ? reject(err) : resolve(results[0].count))),
        new Promise((resolve, reject) => db.query(queries.movimientosHoy, (err, results) => err ? reject(err) : resolve(results[0].count))),
        new Promise((resolve, reject) => db.query(queries.stockCritico, (err, results) => err ? reject(err) : resolve(results[0].count))),
        new Promise((resolve, reject) => db.query(queries.stockPorCategoria, (err, results) => err ? reject(err) : resolve(results)))
    ])
    .then(([totalProductos, movimientosHoy, stockCritico, stockPorCategoria]) => {
        res.json({ totalProductos, movimientosHoy, stockCritico, stockPorCategoria });
    })
    .catch(err => {
        console.error('Error en el dashboard:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    });
});

module.exports = router;