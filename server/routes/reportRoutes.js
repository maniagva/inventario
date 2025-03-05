const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/:tipo', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Auditor' && req.user.rol !== 'Contador') {
        return res.status(403).json({ message: 'No tienes permiso para ver reportes' });
    }
    const { tipo } = req.params;
    if (tipo === 'stock_bajo') {
        const query = `
            SELECT ia.id_inventario, p.nombre AS producto, u.nombre AS ubicacion, ia.stock_actual
            FROM Inventario_Actual ia
            JOIN Productos p ON ia.id_producto = p.id_producto
            JOIN Ubicaciones u ON ia.id_ubicacion = u.id_ubicacion
            WHERE ia.stock_actual < 10
        `;
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ message: 'Error en el servidor' });
            res.json(results);
        });
    } else if (tipo === 'movimientos_dia') {
        const query = `
            SELECT m.id_movimiento, p.nombre AS producto, u.nombre AS ubicacion, e.nombre AS empleado,
                   m.tipo_movimiento, m.cantidad, m.fecha
            FROM Movimientos_Inventario m
            JOIN Productos p ON m.id_producto = p.id_producto
            JOIN Ubicaciones u ON m.id_ubicacion = u.id_ubicacion
            JOIN Empleados e ON m.id_empleado = e.id_empleado
            WHERE DATE(m.fecha) = CURDATE()
        `;
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ message: 'Error en el servidor' });
            res.json(results);
        });
    } else {
        res.status(400).json({ message: 'Tipo de reporte no válido' });
    }
});

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Auditor' && req.user.rol !== 'Supervisor') {
        return res.status(403).json({ message: 'No tienes permiso para ver el dashboard' });
    }
    const query = `
        SELECT
    (SELECT COUNT(*) FROM Productos) AS totalProductos,
    (SELECT COUNT(*) FROM Movimientos_Inventario WHERE DATE(fecha) = CURDATE()) AS movimientosHoy,
    (SELECT COUNT(*) FROM Inventario_Actual WHERE stock_actual < 10) AS stockCritico,
    (SELECT JSON_ARRAYAGG(
        JSON_OBJECT('categoria', nombre_categoria, 'stock', stock_total)
    )
    FROM (
        SELECT c.nombre AS nombre_categoria, SUM(ia.stock_actual) AS stock_total
        FROM Inventario_Actual ia
        JOIN Productos p ON ia.id_producto = p.id_producto
        JOIN Categorias c ON p.id_categoria = c.id_categoria
        GROUP BY c.nombre
    ) AS stock_por_categoria) AS stockPorCategoria;

    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json({
            totalProductos: results[0].totalProductos,
            movimientosHoy: results[0].movimientosHoy,
            stockCritico: results[0].stockCritico,
            stockPorCategoria: JSON.parse(results[0].stockPorCategoria || '[]')
        });
    });
});

module.exports = router;