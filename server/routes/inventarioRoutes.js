const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Auditor') {
        return res.status(403).json({ message: 'No tienes permiso para ver inventario' });
    }
    const query = `
        SELECT ia.id_inventario, p.nombre AS producto, u.nombre AS ubicacion, ia.stock_actual, ia.fecha_actualizacion
        FROM Inventario_Actual ia
        JOIN Productos p ON ia.id_producto = p.id_producto
        JOIN Ubicaciones u ON ia.id_ubicacion = u.id_ubicacion
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

module.exports = router;