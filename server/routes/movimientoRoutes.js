const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista' && req.user.rol !== 'Auditor') {
        return res.status(403).json({ message: 'No tienes permiso para ver movimientos' });
    }
    const query = `
        SELECT m.id_movimiento, p.nombre AS producto, u.nombre AS ubicacion, e.nombre AS empleado,
               m.tipo_movimiento, m.cantidad, m.fecha
        FROM Movimientos_Inventario m
        JOIN Productos p ON m.id_producto = p.id_producto
        JOIN Ubicaciones u ON m.id_ubicacion = u.id_ubicacion
        JOIN Empleados e ON m.id_empleado = e.id_empleado
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista') {
        return res.status(403).json({ message: 'No tienes permiso para registrar movimientos' });
    }
    const { id_producto, id_ubicacion, tipo_movimiento, cantidad } = req.body;
    const id_empleado = req.user.id_empleado;

    if (!id_producto || !id_ubicacion || !tipo_movimiento || !cantidad) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser un número entero positivo' });
    }

    if (tipo_movimiento === 'Salida') {
        const checkStockQuery = `
            SELECT stock_actual FROM Inventario_Actual 
            WHERE id_producto = ? AND id_ubicacion = ?
        `;
        db.query(checkStockQuery, [id_producto, id_ubicacion], (err, results) => {
            if (err) {
                console.error('Error verificando stock:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }
            const stockActual = results.length > 0 ? results[0].stock_actual : 0;
            if (stockActual < cantidad) {
                return res.status(400).json({ message: 'Stock insuficiente para realizar la salida' });
            }
            insertMovement();
        });
    } else {
        insertMovement();
    }

    function insertMovement() {
        const queryMovimiento = `
            INSERT INTO Movimientos_Inventario (id_producto, id_ubicacion, id_empleado, tipo_movimiento, cantidad)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(queryMovimiento, [id_producto, id_ubicacion, id_empleado, tipo_movimiento, cantidad], (err) => {
            if (err) {
                console.error('Error insertando movimiento:', err);
                return res.status(500).json({ message: 'Error al registrar movimiento' });
            }
            const updateQuery = `
                INSERT INTO Inventario_Actual (id_producto, id_ubicacion, stock_actual)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE stock_actual = stock_actual + (CASE WHEN ? = 'Entrada' THEN ? ELSE -? END)
            `;
            db.query(updateQuery, [id_producto, id_ubicacion, tipo_movimiento === 'Entrada' ? cantidad : -cantidad, tipo_movimiento, cantidad, cantidad], (err) => {
                if (err) {
                    console.error('Error actualizando inventario:', err);
                    return res.status(500).json({ message: 'Error al actualizar inventario' });
                }
                res.json({ message: 'Movimiento registrado exitosamente' });
            });
        });
    }
});

module.exports = router;