const bcrypt = require('bcrypt');

// Lista de contraseñas para cada empleado (ajústalas según necesites)
const empleados = [
    { id: 1, correo: 'juan.perez@seguridad.com', contrasena: 'admin123' },
    { id: 2, correo: 'maria.gomez@seguridad.com', contrasena: 'almacen123' },
    { id: 3, correo: 'carlos.lopez@seguridad.com', contrasena: 'auditor123' },
    { id: 4, correo: 'ana.rodriguez@seguridad.com', contrasena: 'tecnico123' },
    { id: 5, correo: 'luis.martinez@seguridad.com', contrasena: 'supervisor123' },
    { id: 6, correo: 'sofia.diaz@seguridad.com', contrasena: 'contador123' }
];

// Función para generar y mostrar los hashes
async function generateHashes() {
    for (const empleado of empleados) {
        try {
            const hash = await bcrypt.hash(empleado.contrasena, 10); // 10 es el número de rondas de sal
            console.log(`UPDATE Empleados SET contrasena_hash = '${hash}' WHERE id_empleado = ${empleado.id}; -- ${empleado.correo}: ${empleado.contrasena}`);
        } catch (error) {
            console.error(`Error generando hash para ${empleado.correo}:`, error);
        }
    }
}

// Ejecutar la función
generateHashes();