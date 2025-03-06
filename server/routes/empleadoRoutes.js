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
        SELECT e.id_empleado, e.nombre, e.correo, e.telefono, r.nombre_rol AS nombre_rol
        FROM Empleados e
        JOIN Roles r ON e.id_rol = r.id_rol
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
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

router.post('/', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, correo, telefono, id_rol, contrasena } = req.body;
    if (!nombre || !correo || !telefono || !id_rol || !contrasena) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const checkQuery = 'SELECT id_empleado FROM Empleados WHERE correo = ?';
    db.query(checkQuery, [correo], (err, results) => {
        if (err) {
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
                return res.status(500).json({ message: 'Error al registrar empleado' });
            }
            db.query(query, [nombre, correo, telefono, id_rol, hash], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al agregar empleado' });
                }
                res.json({ message: 'Empleado agregado exitosamente' });
            });
        });
    });
});

router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { nombre, correo, telefono, id_rol, contrasena } = req.body;
    if (!nombre || !correo || !telefono || !id_rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const checkQuery = 'SELECT id_empleado FROM Empleados WHERE correo = ? AND id_empleado != ?';
    db.query(checkQuery, [correo, req.params.id], (err, results) => {
        if (err) {
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
                    return res.status(500).json({ message: 'Error al actualizar empleado' });
                }
                query = `
                    UPDATE Empleados 
                    SET nombre = ?, correo = ?, telefono = ?, id_rol = ?, contrasena_hash = ?
                    WHERE id_empleado = ?
                `;
                params = [nombre, correo, telefono, id_rol, hash, req.params.id];
                db.query(query, params, (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error al actualizar empleado' });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ message: 'Empleado no encontrado' });
                    }
                    res.json({ message: 'Empleado actualizado exitosamente' });
                });
            });
        } else {
            db.query(query, params, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al actualizar empleado' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Empleado no encontrado' });
                }
                res.json({ message: 'Empleado actualizado exitosamente' });
            });
        }
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const query = 'DELETE FROM Empleados WHERE id_empleado = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: 'No se puede eliminar el empleado porque está referenciado en otros registros' });
            }
            return res.status(500).json({ message: 'Error al eliminar empleado' });
        }
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Empleado no encontrado' });
        res.json({ message: 'Empleado eliminado exitosamente' });
    });
});

// Ruta para cambiar contraseña
router.put('/cambiar-contrasena', authenticateToken, async (req, res) => {
    const { contrasenaActual, contrasenaNueva } = req.body;
    const id_empleado = req.user.id_empleado; // Obtenido del token JWT

    if (!contrasenaActual || !contrasenaNueva) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        // Obtener la contraseña actual del usuario
        const [rows] = await db.query('SELECT contrasena FROM Empleados WHERE id_empleado = ?', [id_empleado]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const contrasenaHash = rows[0].contrasena;
        // Verificar la contraseña actual
        const match = await bcrypt.compare(contrasenaActual, contrasenaHash);
        if (!match) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Hashear la nueva contraseña
        const nuevaContrasenaHash = await bcrypt.hash(contrasenaNueva, 10);
        // Actualizar la contraseña en la base de datos
        await db.query('UPDATE Empleados SET contrasena = ? WHERE id_empleado = ?', [nuevaContrasenaHash, id_empleado]);

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
});

module.exports = router;