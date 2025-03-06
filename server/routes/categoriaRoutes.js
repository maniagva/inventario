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
    if (req.user.rol !== 'Administrador') {
        console.log('Usuario no tiene rol Administrador:', req.user.rol);
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción. Se requiere rol de Administrador.' });
    }
    console.log('Cuerpo completo recibido en POST /api/categorias:', req.body); // Depuración detallada
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        console.log('Validación fallida: nombre no válido', { nombre });
        return res.status(400).json({ message: 'El nombre de la categoría es obligatorio y debe ser una cadena válida' });
    }

    const query = `
        INSERT INTO Categorias (nombre, descripcion)
        VALUES (?, ?)
    `;
    db.query(query, [nombre.trim(), descripcion || ''], (err) => {
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
    const id = req.params.id;

    // Verificar si hay productos relacionados
    db.query('SELECT COUNT(*) as count FROM Productos WHERE id_categoria = ?', [id], (err, results) => {
        if (err) {
            console.error('Error verificando productos relacionados:', err);
            return res.status(500).json({ message: 'Error al verificar categoría' });
        }
        console.log(`Categoría ID ${id} tiene ${results[0].count} productos relacionados`); // Depuración
        if (results[0].count > 0) {
            return res.status(400).json({ message: 'No se puede eliminar la categoría porque tiene productos relacionados' });
        }

        // Si no hay productos, proceder con la eliminación
        db.query('DELETE FROM Categorias WHERE id_categoria = ?', [id], (err, results) => {
            if (err) {
                console.error('Error eliminando categoría:', err);
                return res.status(500).json({ message: 'Error al eliminar categoría' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }
            res.json({ message: 'Categoría eliminada exitosamente' });
        });
    });
});

module.exports = router;