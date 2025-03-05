const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware');

router.get('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para ver empleados' });
    }
    const query = `
        SELECT e.id_empleado, e.nombre, e.correo, e.telefono, r.nombre_rol
        FROM Empleados e
        JOIN Roles r ON e.id_rol = r.id_rol
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/empleados/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'No tienes permiso para ver empleados' });
    }
    const query = `
        SELECT id_empleado, nombre, correo, telefono, id_rol 
        FROM Empleados 
        WHERE id_empleado = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Empleado no encontrado' });
        res.json(results[0]);
    });
});

router.post('/empleados', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, correo, telefono, id_rol, contrasena } = req.body;
    if (!nombre || !correo || !telefono || !id_rol || !contrasena) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const checkQuery = 'SELECT id_empleado FROM Empleados WHERE correo = ?';
    db.query(checkQuery, [correo], (err, results) => {
        if (err) {
            console.error('Error verificando correo:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'El correo ya está en uso' });
        }
        const query = `
            INSERT INTO Empleados (nombre, correo, telefono, id_rol, contrasena_hash)
            VALUES (?, ?, ?, ?, ?)
        `;
        bcrypt.hash(contrasena, 10, (err, hash) => {
            if (err) {
                console.error('Error hash contraseña:', err);
                return res.status(500).json({ message: 'Error al registrar empleado' });
            }
            db.query(query, [nombre, correo, telefono, id_rol, hash], (err) => {
                if (err) {
                    console.error('Error agregando empleado:', err);
                    return res.status(500).json({ message: 'Error al agregar empleado' });
                }
                res.json({ message: 'Empleado agregado exitosamente' });
            });
        });
    });
});

router.put('/empleados/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, correo, telefono, id_rol, contrasena } = req.body;
    if (!nombre || !correo || !telefono || !id_rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const checkQuery = 'SELECT id_empleado FROM Empleados WHERE correo = ? AND id_empleado != ?';
    db.query(checkQuery, [correo, req.params.id], (err, results) => {
        if (err) {
            console.error('Error verificando correo:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'El correo ya está en uso por otro empleado' });
        }
        let query = `
            UPDATE Empleados 
            SET nombre = ?, correo = ?, telefono = ?, id_rol = ?
            WHERE id_empleado = ?
        `;
        let params = [nombre, correo, telefono, id_rol, req.params.id];
        if (contrasena) {
            bcrypt.hash(contrasena, 10, (err, hash) => {
                if (err) {
                    console.error('Error hash contraseña:', err);
                    return res.status(500).json({ message: 'Error al actualizar empleado' });
                }
                query = `
                    UPDATE Empleados 
                    SET nombre = ?, correo = ?, telefono = ?, id_rol = ?, contrasena_hash = ?
                    WHERE id_empleado = ?
                `;
                params = [nombre, correo, telefono, id_rol, hash, req.params.id];
                db.query(query, params, (err) => {
                    if (err) {
                        console.error('Error actualizando empleado:', err);
                        return res.status(500).json({ message: 'Error al actualizar empleado' });
                    }
                    res.json({ message: 'Empleado actualizado exitosamente' });
                });
            });
        } else {
            db.query(query, params, (err) => {
                if (err) {
                    console.error('Error actualizando empleado:', err);
                    return res.status(500).json({ message: 'Error al actualizar empleado' });
                }
                res.json({ message: 'Empleado actualizado exitosamente' });
            });
        }
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