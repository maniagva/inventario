const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware');

router.put('/cambiar_contrasena', authenticateToken, (req, res) => {
    if (req.user.rol !== 'Administrador') return res.status(403).json({ message: 'No tienes permiso' });
    const { contrasena_actual, contrasena_nueva } = req.body;
    if (!contrasena_actual || !contrasena_nueva) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const query = 'SELECT contrasena_hash FROM Empleados WHERE id_empleado = ?';
    db.query(query, [req.user.id_empleado], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'Empleado no encontrado' });
        const match = await bcrypt.compare(contrasena_actual, results[0].contrasena_hash);
        if (!match) return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        const hash = await bcrypt.hash(contrasena_nueva, 10);
        const updateQuery = 'UPDATE Empleados SET contrasena_hash = ? WHERE id_empleado = ?';
        db.query(updateQuery, [hash, req.user.id_empleado], (err) => {
            if (err) {
                console.error('Error actualizando contraseña:', err);
                return res.status(500).json({ message: 'Error al cambiar contraseña' });
            }
            res.json({ message: 'Contraseña cambiada exitosamente' });
        });
    });
});

module.exports = router;