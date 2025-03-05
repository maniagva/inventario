const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista') {
        return res.status(403).json({ message: 'No tienes permiso para ver ubicaciones' });
    }
    const query = 'SELECT id_ubicacion, nombre, direccion, tipo FROM Ubicaciones';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista') {
        return res.status(403).json({ message: 'No tienes permiso para ver ubicaciones' });
    }
    const query = 'SELECT id_ubicacion, nombre, direccion, tipo FROM Ubicaciones WHERE id_ubicacion = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
        res.json(results[0]);
    });
});

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista') {
        return res.status(403).json({ message: 'No tienes permiso' });
    }
    const { nombre, direccion, tipo } = req.body;
    if (!nombre || !direccion || !tipo) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        INSERT INTO Ubicaciones (nombre, direccion, tipo)
        VALUES (?, ?, ?)
    `;
    db.query(query, [nombre, direccion, tipo], (err) => {
        if (err) {
            console.error('Error agregando ubicación:', err);
            return res.status(500).json({ message: 'Error al agregar ubicación' });
        }
        res.json({ message: 'Ubicación agregada exitosamente' });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista') {
        return res.status(403).json({ message: 'No tienes permiso' });
    }
    const { nombre, direccion, tipo } = req.body;
    if (!nombre || !direccion || !tipo) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        UPDATE Ubicaciones 
        SET nombre = ?, direccion = ?, tipo = ?
        WHERE id_ubicacion = ?
    `;
    db.query(query, [nombre, direccion, tipo, req.params.id], (err) => {
        if (err) {
            console.error('Error actualizando ubicación:', err);
            return res.status(500).json({ message: 'Error al actualizar ubicación' });
        }
        res.json({ message: 'Ubicación actualizada exitosamente' });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Almacenista') {
        return res.status(403).json({ message: 'No tienes permiso' });
    }
    const query = 'DELETE FROM Ubicaciones WHERE id_ubicacion = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error eliminando ubicación:', err);
            return res.status(500).json({ message: 'Error al eliminar ubicación' });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
        res.json({ message: 'Ubicación eliminada exitosamente' });
    });
});

module.exports = router;