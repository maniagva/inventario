const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware');

router.post('/login', (req, res) => {
    console.log('Solicitud recibida en POST /api/auth/login');
    const { correo, contrasena } = req.body;
    const query = 'SELECT e.id_empleado, e.correo, e.contrasena_hash, r.nombre_rol, r.id_rol FROM Empleados e JOIN Roles r ON e.id_rol = r.id_rol WHERE e.correo = ?';
    db.query(query, [correo], async (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

        const empleado = results[0];
        const match = await bcrypt.compare(contrasena, empleado.contrasena_hash);
        if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id_empleado: empleado.id_empleado, rol: empleado.nombre_rol },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.json({ token, rol: empleado.nombre_rol, correo: empleado.correo });
    });
});

module.exports = router;