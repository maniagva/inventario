const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para ver roles' });
    }
    const query = 'SELECT id_rol, nombre_rol, descripcion FROM Roles';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para ver roles' });
    }
    const query = 'SELECT id_rol, nombre_rol, descripcion FROM Roles WHERE id_rol = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Rol no encontrado' });
        res.json(results[0]);
    });
});

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre_rol, descripcion } = req.body;
    if (!nombre_rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        INSERT INTO Roles (nombre_rol, descripcion)
        VALUES (?, ?)
    `;
    db.query(query, [nombre_rol, descripcion || ''], (err) => {
        if (err) {
            console.error('Error agregando rol:', err);
            return res.status(500).json({ message: 'Error al agregar rol' });
        }
        res.json({ message: 'Rol agregado exitosamente' });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre_rol, descripcion } = req.body;
    if (!nombre_rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        UPDATE Roles 
        SET nombre_rol = ?, descripcion = ?
        WHERE id_rol = ?
    `;
    db.query(query, [nombre_rol, descripcion || '', req.params.id], (err) => {
        if (err) {
            console.error('Error actualizando rol:', err);
            return res.status(500).json({ message: 'Error al actualizar rol' });
        }
        res.json({ message: 'Rol actualizado exitosamente' });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const query = 'DELETE FROM Roles WHERE id_rol = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error eliminando rol:', err);
            return res.status(500).json({ message: 'Error al eliminar rol' });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Rol no encontrado' });
        res.json({ message: 'Rol eliminado exitosamente' });
    });
});

module.exports = router;