const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

router.get('/checkCodigo', authenticateToken, (req, res) => {
    const { codigo, id } = req.query;
    if (!codigo) {
        return res.status(400).json({ message: 'Código requerido', exists: false });
    }
    const query = 'SELECT id_producto, codigo FROM Productos WHERE codigo = ? AND id_producto != ?';
    db.query(query, [codigo, parseInt(id) || 0], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor', exists: false });
        }
        const exists = results.length > 0;
        res.json({ exists, product: exists ? results[0] : null });
    });
});

router.get('/', authenticateToken, (req, res) => {
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
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción. Se requiere rol de Administrador.' });
    }
    const { nombre, codigo, id_categoria, id_proveedor, precio_unitario } = req.body;

    if (!nombre || !codigo || !id_categoria || !id_proveedor || precio_unitario === undefined) {
        return res.status(400).json({ message: 'Faltan campos requeridos: nombre, código, categoría, proveedor y precio son obligatorios' });
    }

    const query = `
        INSERT INTO Productos (nombre, codigo, id_categoria, id_proveedor, precio_unitario)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [nombre, codigo, parseInt(id_categoria), parseInt(id_proveedor), parseFloat(precio_unitario)], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'El código del producto ya existe en la base de datos' });
            }
            return res.status(500).json({ message: 'Error al agregar producto', error: err.message });
        }
        res.json({ message: 'Producto agregado exitosamente' });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción. Se requiere rol de Administrador.' });
    }
    const id = req.params.id;
    const { nombre, codigo, id_categoria, id_proveedor, precio_unitario } = req.body;

    if (!nombre || !codigo || !id_categoria || !id_proveedor || precio_unitario === undefined) {
        return res.status(400).json({ message: 'Faltan campos requeridos: nombre, código, categoría, proveedor y precio son obligatorios' });
    }

    const query = `
        UPDATE Productos 
        SET nombre = ?, codigo = ?, id_categoria = ?, id_proveedor = ?, precio_unitario = ?
        WHERE id_producto = ?
    `;
    db.query(query, [nombre, codigo, parseInt(id_categoria), parseInt(id_proveedor), parseFloat(precio_unitario), parseInt(id)], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'El código del producto ya existe en la base de datos' });
            }
            return res.status(500).json({ message: 'Error al actualizar producto', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado exitosamente' });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const id = req.params.id;

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar producto' });
        }

        db.query('DELETE FROM Inventario_Actual WHERE id_producto = ?', [id], (err) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ message: 'Error al eliminar producto relacionado en inventario' });
                });
            }

            db.query('DELETE FROM Movimientos_Inventario WHERE id_producto = ?', [id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error al eliminar producto relacionado en movimientos' });
                    });
                }

                db.query('DELETE FROM Productos WHERE id_producto = ?', [id], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Error al eliminar producto' });
                        });
                    }
                    if (results.affectedRows === 0) {
                        return db.rollback(() => {
                            res.status(404).json({ message: 'Producto no encontrado' });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ message: 'Error al eliminar producto' });
                            });
                        }
                        res.json({ message: 'Producto eliminado exitosamente' });
                    });
                });
            });
        });
    });
});

module.exports = router;