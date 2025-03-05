const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    console.log('Solicitud recibida en GET /api/productos');
    const query = `
        SELECT p.id_producto, p.nombre, p.codigo, c.nombre AS categoria, pr.nombre AS proveedor, p.precio_unitario
        FROM Productos p
        JOIN Categorias c ON p.id_categoria = c.id_categoria
        JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    const query = `
        SELECT id_producto, nombre, codigo, id_categoria, id_proveedor, precio_unitario 
        FROM Productos 
        WHERE id_producto = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(results[0]);
    });
});

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, codigo, id_categoria, id_proveedor, precio_unitario } = req.body;
    if (!nombre || !codigo || !id_categoria || !id_proveedor || !precio_unitario) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (precio_unitario < 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor o igual a 0' });
    }
    const checkQuery = 'SELECT id_producto FROM Productos WHERE codigo = ?';
    db.query(checkQuery, [codigo], (err, results) => {
        if (err) {
            console.error('Error verificando código:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'El código ya está en uso por otro producto' });
        }
        const query = `
            INSERT INTO Productos (nombre, codigo, id_categoria, id_proveedor, precio_unitario)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(query, [nombre, codigo, id_categoria, id_proveedor, precio_unitario], (err) => {
            if (err) {
                console.error('Error agregando producto:', err);
                return res.status(500).json({ message: 'Error al agregar producto' });
            }
            res.json({ message: 'Producto agregado exitosamente' });
        });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, codigo, id_categoria, id_proveedor, precio_unitario } = req.body;
    if (!nombre || !codigo || !id_categoria || !id_proveedor || !precio_unitario) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (precio_unitario < 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor o igual a 0' });
    }
    const checkQuery = 'SELECT id_producto FROM Productos WHERE codigo = ? AND id_producto != ?';
    db.query(checkQuery, [codigo, req.params.id], (err, results) => {
        if (err) {
            console.error('Error verificando código:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'El código ya está en uso por otro producto' });
        }
        const query = `
            UPDATE Productos 
            SET nombre = ?, codigo = ?, id_categoria = ?, id_proveedor = ?, precio_unitario = ?
            WHERE id_producto = ?
        `;
        db.query(query, [nombre, codigo, id_categoria, id_proveedor, precio_unitario, req.params.id], (err) => {
            if (err) {
                console.error('Error actualizando producto:', err);
                return res.status(500).json({ message: 'Error al actualizar producto' });
            }
            res.json({ message: 'Producto actualizado exitosamente' });
        });
    });
});

router.get('/checkCodigo', authenticateToken, (req, res) => {
    const { codigo, id } = req.query;
    if (!codigo) {
        return res.status(400).json({ message: 'Código requerido', exists: false });
    }
    const query = 'SELECT id_producto, codigo FROM Productos WHERE codigo = ?';
    db.query(query, [codigo], (err, results) => {
        if (err) {
            console.error('Error verificando código:', err);
            return res.status(500).json({ message: 'Error en el servidor', exists: false });
        }
        const exists = results.length > 0;
        if (exists && id) {
            const product = results[0];
            if (product.id_producto.toString() === id.toString()) {
                return res.json({ exists: false, product });
            }
        }
        res.json({ exists, product: exists ? results[0] : null });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const query = 'DELETE FROM Productos WHERE id_producto = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error eliminando producto:', err);
            return res.status(500).json({ message: 'Error al eliminar producto' });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado exitosamente' });
    });
});

module.exports = router;