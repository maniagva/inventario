import { showNotification } from './ui.js';
import { filterTable } from './tables.js';
import { fetchData } from './api.js';

function showAddForm(sectionId) {
    const form = document.getElementById(`${sectionId}Form`);
    if (!form) return;
    form.style.display = 'block';
    const formTitle = document.getElementById(`${sectionId}FormTitle`);
    if (formTitle) {
        formTitle.textContent = `Agregar ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1, -1)}`;
    }
    const formElement = document.getElementById(`${sectionId}AddEditForm`);
    if (formElement) formElement.reset();
    const idField = document.getElementById(`${sectionId}Id`);
    if (idField) idField.value = '';
    if (sectionId === 'empleados') {
        const contrasenaField = document.getElementById('empleadoContrasena');
        if (contrasenaField) {
            contrasenaField.required = true;
            contrasenaField.style.display = 'block';
        }
    }
}

function hideForm(sectionId) {
    const form = document.getElementById(`${sectionId}Form`);
    if (form) form.style.display = 'none';
    else console.error(`Formulario ${sectionId}Form no encontrado`);
}

function editItem(sectionId, id) {
    fetch(`/api/${sectionId}/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(response => {
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            const form = document.getElementById(`${sectionId}Form`);
            if (!form) throw new Error(`Formulario ${sectionId}Form no encontrado`);
            form.style.display = 'block';
            document.getElementById(`${sectionId}FormTitle`).textContent = `Editar ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1, -1)}`;
            const idField = document.getElementById(`${sectionId}Id`);
            if (idField) idField.value = id;
            if (sectionId === 'empleados') {
                const idField = document.getElementById('empleadoId');
                if (idField) {
                    idField.value = id;
                } else {
                    console.error('No se encontró el elemento empleadoId');
                }
                document.getElementById('empleadoNombre').value = data.nombre || '';
                document.getElementById('empleadoCorreo').value = data.correo || '';
                document.getElementById('empleadoTelefono').value = data.telefono || '';
                document.getElementById('empleadoRol').value = data.id_rol || '';
                const contrasenaField = document.getElementById('empleadoContrasena');
                if (contrasenaField) {
                    contrasenaField.required = false;
                    contrasenaField.style.display = 'none';
                    contrasenaField.value = '';
                }
            }  else if (sectionId === 'proveedores') {
                const idField = document.getElementById('proveedorId');
                if (idField) {
                    idField.value = id;
                } else {
                    console.error('No se encontró el elemento proveedorId');
                }
                document.getElementById('proveedorNombre').value = data.nombre || '';
                document.getElementById('proveedorContacto').value = data.contacto || '';
                document.getElementById('proveedorTelefono').value = data.telefono || '';
                document.getElementById('proveedorCorreo').value = data.correo || '';
            
            } else if (sectionId === 'categorias') {
                document.getElementById('categoriaNombre').value = data.nombre || '';
                document.getElementById('categoriaDescripcion').value = data.descripcion || '';
            } else if (sectionId === 'ubicaciones') {
                const idField = document.getElementById('ubicacionId');
                if (idField) {
                    idField.value = id;
                } else {
                    console.error('No se encontró el elemento ubicacionId');
                }
                document.getElementById('ubicacionNombre').value = data.nombre || '';
                document.getElementById('ubicacionDireccion').value = data.direccion || '';
                document.getElementById('ubicacionTipo').value = data.tipo || '';
            } else if (sectionId === 'roles') {
                const idField = document.getElementById('rolId');
                if (idField) {
                    idField.value = id;
                } else {
                    console.error('No se encontró el elemento rolId');
                }
                document.getElementById('rolNombre').value = data.nombre_rol || '';
                document.getElementById('rolDescripcion').value = data.descripcion || '';
            } else if (sectionId === 'productos') {
                const idField = document.getElementById('productoId');
                if (idField) idField.value = data.id_producto || '';
                document.getElementById('productoNombre').value = data.nombre || '';
                document.getElementById('productoCodigo').value = data.codigo || '';
                document.getElementById('productoCategoria').value = data.id_categoria || '';
                document.getElementById('productoProveedor').value = data.id_proveedor || '';
                document.getElementById('productoPrecio').value = data.precio_unitario || '';
            }
        })
        .catch(error => {
            console.error(`Error cargando ${sectionId} para edición:`, error);
            showNotification(`Error al cargar datos de ${sectionId}`, true);
        });
}

function deleteItem(sectionId, id) {
    if (confirm(`¿Estás seguro de eliminar este ${sectionId.slice(0, -1)}?`)) {
        fetch(`/api/${sectionId}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || `Error ${response.status}: ${response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                showNotification(data.message);
                filterTable(sectionId, true);
            })
            .catch(error => {
                console.error(`Error eliminando ${sectionId}:`, error);
                showNotification(error.message || `Error al eliminar ${sectionId.slice(0, -1)}`, true);
            });
    }
}

function validateForm(sectionId) {
    const inputs = {
        empleados: {
            nombre: { elementId: 'empleadoNombre', minLength: 2 },
            correo: { elementId: 'empleadoCorreo', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,required: true },
            telefono: { elementId: 'empleadoTelefono', regex: /^\d{7,15}$/, required: true },
            contrasena: { 
                elementId: 'empleadoContrasena', 
                minLength: 6, 
                required: !document.getElementById('empleadoId')?.value && document.getElementById('empleadoContrasena')?.style.display !== 'none' 
            }
        },
        proveedores: {
            nombre: { elementId: 'proveedorNombre', minLength: 2 },
            contacto: { elementId: 'proveedorContacto', minLength: 2 },
            telefono: { elementId: 'proveedorTelefono', regex: /^\d{7,15}$/ },
            correo: { elementId: 'proveedorCorreo', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
        },
        categorias: {
            nombre: { elementId: 'categoriaNombre', minLength: 2 }
        },
        ubicaciones: {
            nombre: { elementId: 'ubicacionNombre', minLength: 2 },
            direccion: { elementId: 'ubicacionDireccion', minLength: 5 },
            tipo: { elementId: 'ubicacionTipo', minLength: 2 }
        },
        roles: {
            nombre_rol: { elementId: 'rolNombre', minLength: 2 }
        },
        movimiento: {
            cantidad: { elementId: 'cantidad', minValue: 1 }
        },
        cambiarContrasena: {
            contrasenaActual: { elementId: 'contrasenaActual', minLength: 6 },
            contrasenaNueva: { elementId: 'contrasenaNueva', minLength: 6 }
        },
        productos: {
            nombre: { elementId: 'productoNombre', minLength: 2 },
            codigo: { elementId: 'productoCodigo', minLength: 1 },
            categoria: { elementId: 'productoCategoria', required: true },
            proveedor: { elementId: 'productoProveedor', required: true },
            precio: { elementId: 'productoPrecio', minValue: 0 }
        }
    };

    const sectionData = inputs[sectionId];
    if (!sectionData) {
        console.warn(`No se encontró configuración de validación para ${sectionId}`);
        return null;
    }

    for (let field in sectionData) {
        const { elementId, minLength, minValue, regex, required } = sectionData[field];
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Elemento ${elementId} no encontrado para validar ${sectionId}`);
            continue;
        }
        const value = element.value.trim();
        if (required && !value) {
            return `${field.charAt(0).toUpperCase() + field.slice(1)} es obligatorio`;
        }
        if (value) { // Solo validar reglas adicionales si hay un valor
            if (minLength && value.length < minLength) {
                return `${field.charAt(0).toUpperCase() + field.slice(1)} debe tener al menos ${minLength} caracteres`;
            }
            if (minValue !== undefined && parseFloat(value) < minValue) {
                return `${field.charAt(0).toUpperCase() + field.slice(1)} debe ser mayor o igual a ${minValue}`;
            }
            if (regex && !regex.test(value)) {
                return `${field.charAt(0).toUpperCase() + field.slice(1)} tiene un formato inválido`;
            }
        }
    }
    return null;
}

export { showAddForm, hideForm, editItem, deleteItem, validateForm };