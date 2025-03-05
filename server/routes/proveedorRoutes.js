const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Contador') {
        return res.status(403).json({ message: 'No tienes permiso para ver proveedores' });
    }
    const query = 'SELECT id_proveedor, nombre, contacto, telefono, correo FROM Proveedores';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Contador') {
        return res.status(403).json({ message: 'No tienes permiso para ver proveedores' });
    }
    const query = 'SELECT id_proveedor, nombre, contacto, telefono, correo FROM Proveedores WHERE id_proveedor = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.json(results[0]);
    });
});

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Contador') {
        return res.status(403).json({ message: 'No tienes permiso' });
    }
    const { nombre, contacto, telefono, correo } = req.body;
    if (!nombre || !contacto || !telefono || !correo) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        INSERT INTO Proveedores (nombre, contacto, telefono, correo)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [nombre, contacto, telefono, correo], (err) => {
        if (err) {
            console.error('Error agregando proveedor:', err);
            return res.status(500).json({ message: 'Error al agregar proveedor' });
        }
        res.json({ message: 'Proveedor agregado exitosamente' });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Contador') {
        return res.status(403).json({ message: 'No tienes permiso' });
    }
    const { nombre, contacto, telefono, correo } = req.body;
    if (!nombre || !contacto || !telefono || !correo) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        UPDATE Proveedores 
        SET nombre = ?, contacto = ?, telefono = ?, correo = ?
        WHERE id_proveedor = ?
    `;
    db.query(query, [nombre, contacto, telefono, correo, req.params.id], (err) => {
        if (err) {
            console.error('Error actualizando proveedor:', err);
            return res.status(500).json({ message: 'Error al actualizar proveedor' });
        }
        res.json({ message: 'Proveedor actualizado exitosamente' });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'Contador') {
        return res.status(403).json({ message: 'No tienes permiso' });
    }
    const query = 'DELETE FROM Proveedores WHERE id_proveedor = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error eliminando proveedor:', err);
            return res.status(500).json({ message: 'Error al eliminar proveedor' });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.json({ message: 'Proveedor eliminado exitosamente' });
    });
});

module.exports = router;