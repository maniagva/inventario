import { logout } from './auth.js';
import { showSection, toggleTableLoader, showNotification } from './ui.js';
import { loadTable, filterTable } from './tables.js';
import { showAddForm, hideForm, editItem, deleteItem, validateForm } from './forms.js';
import { fetchData } from './api.js';
import { loadDashboard } from './dashboard.js';
import { loadReporte } from './reports.js';
import { loadFormOptions } from './formOptions.js';

function setupEventListeners() {
    const rol = localStorage.getItem('rol');

    // Ocultar secciones según rol
    if (rol !== 'Administrador' && rol !== 'Almacenista' && rol !== 'Auditor') document.getElementById('movimientosNav').style.display = 'none';
    if (rol !== 'Administrador' && rol !== 'Auditor') document.getElementById('inventarioNav').style.display = 'none';
    if (rol !== 'Administrador') document.getElementById('empleadosNav').style.display = 'none';
    if (rol !== 'Administrador' && rol !== 'Contador') document.getElementById('proveedoresNav').style.display = 'none';
    if (rol !== 'Administrador') document.getElementById('categoriasNav').style.display = 'none';
    if (rol !== 'Administrador' && rol !== 'Almacenista') document.getElementById('ubicacionesNav').style.display = 'none';
    if (rol !== 'Administrador' && rol !== 'Almacenista') document.getElementById('registroMovimientosNav').style.display = 'none';
    if (rol !== 'Administrador' && rol !== 'Auditor' && rol !== 'Contador') document.getElementById('reportesNav').style.display = 'none';
    if (rol !== 'Administrador') document.getElementById('configuracionNav').style.display = 'none';

    // Manejar clics en el sidebar
    document.querySelectorAll('.sidebar button[data-section]').forEach(button => {
        button.addEventListener('click', (e) => {
            const sectionId = e.target.getAttribute('data-section');
            if (sectionId) showSection(sectionId);
        });
    });

    // Manejar logout
    document.querySelector('.sidebar button[data-action="logout"]').addEventListener('click', logout);

    // Manejar botones de acción
    document.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.getAttribute('data-action');
        if (!action) return;

        let tableId = target.getAttribute('data-table') || target.closest('section')?.id;
        if (!tableId && (action === 'edit' || action === 'delete')) {
            tableId = target.closest('table')?.id.replace('Table', '');
        }

        if (action === 'add-product') showAddForm('productos');
        else if (action === 'add-category') showAddForm('categorias');
        else if (action === 'add-employee') showAddForm('empleados');
        else if (action === 'add-supplier') showAddForm('proveedores');
        else if (action === 'add-location') showAddForm('ubicaciones');
        else if (action === 'add-role') showAddForm('roles');
        else if (action === 'cancel-product') hideForm('productos');
        else if (action === 'cancel-category') hideForm('categorias');
        else if (action === 'cancel-employee') hideForm('empleados');
        else if (action === 'cancel-supplier') hideForm('proveedores');
        else if (action === 'cancel-location') hideForm('ubicaciones');
        else if (action === 'cancel-role') hideForm('roles');
        else if (action === 'report-stock') loadReporte('stock_bajo');
        else if (action === 'report-movements') loadReporte('movimientos_dia');
        else if (action === 'edit') {
            const id = target.getAttribute('data-id');
            if (tableId && id) {
                editItem(tableId, id);
            } else {
                console.error('Falta tableId o ID para editar');
            }
        } else if (action === 'delete') {
            const id = target.getAttribute('data-id');
            if (tableId && id) {
                deleteItem(tableId, id);
            } else {
                console.error('Falta tableId o ID para eliminar');
            }
        }
    });

    // Filtrar tablas
    ['productos', 'movimientos', 'inventario', 'empleados', 'proveedores', 'categorias', 'ubicaciones', 'roles'].forEach(tableId => {
        const searchInput = document.getElementById(`search${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`);
        if (searchInput) {
            searchInput.addEventListener('keyup', () => filterTable(tableId, tableId !== 'productos' && tableId !== 'movimientos' && tableId !== 'inventario'));
        }
    });

    // Manejar formularios
    document.getElementById('productosAddEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const validationError = validateForm('productos');
        if (validationError) {
            showNotification(validationError, true);
            return;
        }
        const id = document.getElementById('productoId')?.value || '';
        const nombre = document.getElementById('productoNombre')?.value.trim() || '';
        const codigo = document.getElementById('productoCodigo')?.value.trim() || '';
        const id_categoria = document.getElementById('productoCategoria')?.value || '';
        const id_proveedor = document.getElementById('productoProveedor')?.value || '';
        const precio_unitario = parseFloat(document.getElementById('productoPrecio')?.value) || 0;
    
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/productos/${id}` : '/api/productos';
        const body = { 
            nombre, 
            codigo, 
            id_categoria: parseInt(id_categoria), 
            id_proveedor: parseInt(id_proveedor), 
            precio_unitario 
        };
    
        try {
            let checkResponse = { exists: false };
            if (codigo) {
                const checkUrl = `/api/productos/checkCodigo?codigo=${encodeURIComponent(codigo)}&id=${id || 0}`;
                checkResponse = await fetchData(checkUrl);
            }
    
            if (checkResponse.exists) {
                showNotification('El código ya está en uso por otro producto', true);
                return; // Detener aquí si el código está duplicado
            }
    
            const response = await fetchData(url, { method, body: JSON.stringify(body) });
            showNotification(response.message);
            hideForm('productos');
            toggleTableLoader('productos', true);
            const updatedData = await fetchData('/api/productos');
            loadTable('productos', updatedData, true);
            loadFormOptions();
        } catch (error) {
            showNotification(error.message || 'Error al guardar producto', true);
        }
    });
    document.getElementById('empleadosAddEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const validationError = validateForm('empleados');
        if (validationError) {
            showNotification(validationError, true);
            return;
        }
        const id = document.getElementById('empleadoId').value;
        const contrasena = document.getElementById('empleadoContrasena').value.trim();
        const body = {
            nombre: document.getElementById('empleadoNombre').value,
            correo: document.getElementById('empleadoCorreo').value,
            telefono: document.getElementById('empleadoTelefono').value,
            id_rol: document.getElementById('empleadoRol').value
        };
        if (contrasena) {
            body.contrasena = contrasena;
        }
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/empleados/${id}` : '/api/empleados';
    
        try {
            const response = await fetchData(url, { method, body: JSON.stringify(body) });
            showNotification(response.message);
            hideForm('empleados');
            filterTable('empleados', true);
        } catch (error) {
            console.error('Error guardando empleado:', error);
            showNotification(error.message || 'Error al guardar empleado', true);
        }
    });

    document.getElementById('proveedoresAddEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const validationError = validateForm('proveedores');
        if (validationError) {
            showNotification(validationError, true);
            return;
        }
        const id = document.getElementById('proveedorId').value;
        const body = {
            nombre: document.getElementById('proveedorNombre').value,
            contacto: document.getElementById('proveedorContacto').value,
            telefono: document.getElementById('proveedorTelefono').value,
            correo: document.getElementById('proveedorCorreo').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/proveedores/${id}` : '/api/proveedores';
    
        try {
            const response = await fetchData(url, { method, body: JSON.stringify(body) });
            showNotification(response.message);
            hideForm('proveedores');
            filterTable('proveedores', true);
        } catch (error) {
            console.error('Error guardando proveedor:', error);
            showNotification(error.message || 'Error al guardar proveedor', true);
        }
    });

    document.querySelectorAll('[data-action="delete-supplier"]').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id; // Asumiendo que los botones tienen data-id
            if (confirm('¿Estás seguro de eliminar este proveedor?')) {
                try {
                    const response = await fetchData(`/api/proveedores/${id}`, { method: 'DELETE' });
                    showNotification(response.message);
                    filterTable('proveedores', true);
                } catch (error) {
                    console.error('Error eliminando proveedor:', error);
                    showNotification(error.message || 'Error al eliminar proveedor', true);
                }
            }
        });
    });

    document.getElementById('ubicacionesAddEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const validationError = validateForm('ubicaciones');
        if (validationError) {
            showNotification(validationError, true);
            return;
        }
        const id = document.getElementById('ubicacionId').value;
        const body = {
            nombre: document.getElementById('ubicacionNombre').value,
            direccion: document.getElementById('ubicacionDireccion').value,
            tipo: document.getElementById('ubicacionTipo').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/ubicaciones/${id}` : '/api/ubicaciones';
    
        try {
            const response = await fetchData(url, { method, body: JSON.stringify(body) });
            showNotification(response.message);
            hideForm('ubicaciones');
            filterTable('ubicaciones', true);
        } catch (error) {
            console.error('Error guardando ubicación:', error);
            showNotification(error.message || 'Error al guardar ubicación', true);
        }
    });

    const categoriasForm = document.getElementById('categoriasAddEditForm');
    if (categoriasForm) {
        categoriasForm.removeEventListener('submit', categoriasForm._submitHandler); // Limpiar listener previo si existe
        const submitHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevenir propagación para evitar duplicados
            const validationError = validateForm('categorias');
            if (validationError) {
                showNotification(validationError, true);
                return;
            }
            const id = document.getElementById('categoriaId')?.value || '';
            const nombre = document.getElementById('categoriaNombre')?.value.trim() || '';
            const descripcion = document.getElementById('categoriaDescripcion')?.value.trim() || '';
    
            if (!nombre) {
                showNotification('El nombre de la categoría es obligatorio', true);
                return;
            }
    
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/categorias/${id}` : '/api/categorias';
            const body = { nombre, descripcion };
    
            try {
                const response = await fetchData(url, { method, body: JSON.stringify(body) });
                showNotification(response.message);
                hideForm('categorias'); // Ocultar después de la respuesta
                filterTable('categorias', true);
                loadFormOptions();
            } catch (error) {
                console.error('Error guardando categoría:', error);
                showNotification(error.message || 'Error al guardar categoría', true);
            }
        };
        categoriasForm.addEventListener('submit', submitHandler);
        categoriasForm._submitHandler = submitHandler; // Guardar referencia para limpieza
    }

    const rolesForm = document.getElementById('rolesAddEditForm');
if (rolesForm && !rolesForm.dataset.listenerAdded) {
    rolesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const validationError = validateForm('roles');
        if (validationError) {
            showNotification(validationError, true);
            return;
        }
        const id = document.getElementById('rolId').value;
        const body = {
            nombre_rol: document.getElementById('rolNombre').value,
            descripcion: document.getElementById('rolDescripcion').value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/roles/${id}` : '/api/roles';

        try {
            const response = await fetchData(url, { method, body: JSON.stringify(body) });
            showNotification(response.message);
            hideForm('roles');
            filterTable('roles', true);
        } catch (error) {
            console.error('Error guardando rol:', error);
            showNotification(error.message || 'Error al guardar rol', true);
        }
    });
    rolesForm.dataset.listenerAdded = 'true';
}

    document.getElementById('movimientoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id_producto = document.getElementById('productoSelect').value;
        const id_ubicacion = document.getElementById('ubicacionSelect').value;
        const tipo_movimiento = document.getElementById('tipoMovimiento').value;
        const cantidadInput = document.getElementById('cantidad').value;
        const cantidad = parseInt(cantidadInput);

        if (!id_producto) {
            showNotification('Seleccione un producto', true);
            return;
        }
        if (!id_ubicacion) {
            showNotification('Seleccione una ubicación', true);
            return;
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            showNotification('La cantidad debe ser un número entero positivo', true);
            return;
        }

        try {
            const response = await fetchData('/api/movimientos', { method: 'POST', body: JSON.stringify({ id_producto, id_ubicacion, tipo_movimiento, cantidad }) });
            showNotification(response.message);
            document.getElementById('movimientoForm').reset();
        } catch (error) {
            console.error('Error registrando movimiento:', error);
            showNotification('Error al registrar movimiento', true);
        }
    });

    document.getElementById('cambiarContrasenaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const validationError = validateForm('cambiarContrasena');
        if (validationError) {
            showNotification(validationError, true);
            return;
        }
        const contrasena_actual = document.getElementById('contrasenaActual').value;
        const contrasena_nueva = document.getElementById('contrasenaNueva').value;
        const currentUserEmail = document.getElementById('currentUserEmail');
        currentUserEmail.value = localStorage.getItem('correo') || 'admin@example.com';

        try {
            const response = await fetchData('/api/config/cambiar_contrasena', { method: 'PUT', body: JSON.stringify({ contrasena_actual, contrasena_nueva }) });
            showNotification(response.message);
            document.getElementById('cambiarContrasenaForm').reset();
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            showNotification('Error al cambiar contraseña', true);
        }
    });
}

function loadInitialData() {
    const rol = localStorage.getItem('rol');

    toggleTableLoader('productos', true);
    fetchData('/api/productos')
        .then(data => loadTable('productos', data, rol === 'Administrador'))
        .catch(error => { 
            console.error('Error cargando productos:', error); 
            toggleTableLoader('productos', false); 
            showNotification('Error al cargar productos', true);
        });

    if (rol === 'Administrador' || rol === 'Almacenista' || rol === 'Auditor') {
        toggleTableLoader('movimientos', true);
        fetchData('/api/movimientos')
            .then(data => loadTable('movimientos', data))
            .catch(error => { 
                console.error('Error cargando movimientos:', error); 
                toggleTableLoader('movimientos', false); 
                showNotification('Error al cargar movimientos', true);
            });
    }

    if (rol === 'Administrador' || rol === 'Auditor') {
        toggleTableLoader('inventario', true);
        fetchData('/api/inventario')
            .then(data => loadTable('inventario', data))
            .catch(error => { 
                console.error('Error cargando inventario:', error); 
                toggleTableLoader('inventario', false); 
                showNotification('Error al cargar inventario', true);
            });
    }

    if (rol === 'Administrador') {
        toggleTableLoader('empleados', true);
        fetchData('/api/empleados')
            .then(data => loadTable('empleados', data, true))
            .catch(error => { 
                console.error('Error cargando empleados:', error); 
                toggleTableLoader('empleados', false); 
                showNotification('Error al cargar empleados', true);
            });

        toggleTableLoader('categorias', true);
        fetchData('/api/categorias')
            .then(data => loadTable('categorias', data, true))
            .catch(error => { 
                console.error('Error cargando categorías:', error); 
                toggleTableLoader('categorias', false); 
                showNotification('Error al cargar categorías', true);
            });

        toggleTableLoader('roles', true);
        fetchData('/api/roles')
            .then(data => loadTable('roles', data, true))
            .catch(error => { 
                console.error('Error cargando roles:', error); 
                toggleTableLoader('roles', false); 
                showNotification('Error al cargar roles', true);
            });
    }

    if (rol === 'Administrador' || rol === 'Contador') {
        toggleTableLoader('proveedores', true);
        fetchData('/api/proveedores')
            .then(data => loadTable('proveedores', data, true))
            .catch(error => { 
                console.error('Error cargando proveedores:', error); 
                toggleTableLoader('proveedores', false); 
                showNotification('Error al cargar proveedores', true);
            });
    }

    if (rol === 'Administrador' || rol === 'Almacenista') {
        toggleTableLoader('ubicaciones', true);
        fetchData('/api/ubicaciones')
            .then(data => loadTable('ubicaciones', data, true))
            .catch(error => { 
                console.error('Error cargando ubicaciones:', error); 
                toggleTableLoader('ubicaciones', false); 
                showNotification('Error al cargar ubicaciones', true);
            });
        loadFormOptions();
    }

    loadDashboard();
    if (rol === 'Administrador' || rol === 'Auditor' || rol === 'Contador') {
        loadReporte('stock_bajo');
    }
}

const cambiarContrasenaForm = document.getElementById('cambiarContrasenaForm');
if (cambiarContrasenaForm && !cambiarContrasenaForm.dataset.listenerAdded) {
    cambiarContrasenaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const contrasenaActual = document.getElementById('contrasenaActual').value;
        const contrasenaNueva = document.getElementById('contrasenaNueva').value;
        
        if (!contrasenaActual || !contrasenaNueva) {
            showNotification('Por favor, completa ambos campos', true);
            return;
        }

        if (contrasenaNueva.length < 6) {
            showNotification('La nueva contraseña debe tener al menos 6 caracteres', true);
            return;
        }

        const body = {
            contrasenaActual,
            contrasenaNueva
        };
        console.log('Datos enviados al backend (cambiar contraseña):', JSON.stringify(body, null, 2)); // Log temporal

        try {
            const response = await fetchData('/api/empleados/cambiar-contrasena', {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            console.log('Respuesta del servidor:', response); // Log temporal
            showNotification(response.message);
            document.getElementById('contrasenaMensaje').textContent = response.message;
            document.getElementById('contrasenaMensaje').style.display = 'block';
            cambiarContrasenaForm.reset(); // Limpiar el formulario
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            showNotification(error.message || 'Error al cambiar contraseña', true);
        }
    });
    cambiarContrasenaForm.dataset.listenerAdded = 'true';
}

export { setupEventListeners, loadInitialData };