const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para ver categorías' });
    }
    const query = 'SELECT id_categoria, nombre, descripcion FROM Categorias';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para ver categorías' });
    }
    const query = 'SELECT id_categoria, nombre, descripcion FROM Categorias WHERE id_categoria = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.json(results[0]);
    });
});

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, descripcion } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        INSERT INTO Categorias (nombre, descripcion)
        VALUES (?, ?)
    `;
    db.query(query, [nombre, descripcion || ''], (err) => {
        if (err) {
            console.error('Error agregando categoría:', err);
            return res.status(500).json({ message: 'Error al agregar categoría' });
        }
        res.json({ message: 'Categoría agregada exitosamente' });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, descripcion } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = `
        UPDATE Categorias 
        SET nombre = ?, descripcion = ?
        WHERE id_categoria = ?
    `;
    db.query(query, [nombre, descripcion || '', req.params.id], (err) => {
        if (err) {
            console.error('Error actualizando categoría:', err);
            return res.status(500).json({ message: 'Error al actualizar categoría' });
        }
        res.json({ message: 'Categoría actualizada exitosamente' });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const query = 'DELETE FROM Categorias WHERE id_categoria = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error eliminando categoría:', err);
            return res.status(500).json({ message: 'Error al eliminar categoría' });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.json({ message: 'Categoría eliminada exitosamente' });
    });
});

module.exports = router;