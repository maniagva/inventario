import { showNotification } from './ui.js';
import { filterTable } from './tables.js';

function showAddForm(sectionId) {
    console.log(`Mostrando formulario para ${sectionId}`);
    const form = document.getElementById(`${sectionId}Form`);
    if (!form) return;
    form.style.display = 'block';
    const formTitle = document.getElementById(`${sectionId}FormTitle`);
    if (formTitle) {
        formTitle.textContent = `Agregar ${sectionId === 'newCategoria' ? 'Categoría' : sectionId.charAt(0).toUpperCase() + sectionId.slice(1, -1)}`;
    }
    const formElement = document.getElementById(`${sectionId}Add${sectionId === 'newCategoria' ? 'Form' : 'EditForm'}`);
    if (formElement) formElement.reset();
    const idField = document.getElementById(`${sectionId === 'newCategoria' ? 'categoria' : sectionId}Id`);
    if (idField) idField.value = '';
    if (sectionId === 'empleados') {
        const contrasenaField = document.getElementById('empleadoContrasena');
        contrasenaField.required = true;
        contrasenaField.style.display = 'block';
    }
}

function hideForm(sectionId) {
    console.log(`Ocultando formulario: ${sectionId}Form`);
    const form = document.getElementById(`${sectionId}Form`);
    if (form) form.style.display = 'none';
    else console.error(`Formulario ${sectionId}Form no encontrado`);
}

function editItem(sectionId, id) {
    console.log(`Editando ${sectionId} con ID: ${id}`);
    fetch(`/api/${sectionId}/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(response => {
            console.log(`Respuesta del servidor para GET /api/${sectionId}/${id}: ${response.status}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            const form = document.getElementById(`${sectionId}Form`);
            if (!form) throw new Error(`Formulario ${sectionId}Form no encontrado`);
            form.style.display = 'block';
            document.getElementById(`${sectionId}FormTitle`).textContent = `Editar ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1, -1)}`;
            const idField = document.getElementById(`${sectionId}Id`);
            if (idField) idField.value = id;
            if (sectionId === 'empleados') {
                document.getElementById('empleadoNombre').value = data.nombre || '';
                document.getElementById('empleadoCorreo').value = data.correo || '';
                document.getElementById('empleadoTelefono').value = data.telefono || '';
                document.getElementById('empleadoRol').value = data.id_rol || '';
                const contrasenaField = document.getElementById('empleadoContrasena');
                contrasenaField.required = false;
                contrasenaField.style.display = 'block';
                contrasenaField.value = '';
            } else if (sectionId === 'proveedores') {
                document.getElementById('proveedorNombre').value = data.nombre || '';
                document.getElementById('proveedorContacto').value = data.contacto || '';
                document.getElementById('proveedorTelefono').value = data.telefono || '';
                document.getElementById('proveedorCorreo').value = data.correo || '';
            } else if (sectionId === 'categorias') {
                document.getElementById('categoriaNombre').value = data.nombre || '';
                document.getElementById('categoriaDescripcion').value = data.descripcion || '';
            } else if (sectionId === 'ubicaciones') {
                document.getElementById('ubicacionNombre').value = data.nombre || '';
                document.getElementById('ubicacionDireccion').value = data.direccion || '';
                document.getElementById('ubicacionTipo').value = data.tipo || '';
            } else if (sectionId === 'roles') {
                document.getElementById('rolNombre').value = data.nombre_rol || '';
                document.getElementById('rolDescripcion').value = data.descripcion || '';
            } else if (sectionId === 'productos') {
                document.getElementById('productoNombre').value = data.nombre || '';
                document.getElementById('productoCodigo').value = data.codigo || '';
                document.getElementById('productoCategoria').value = data.id_categoria || '';
                document.getElementById('productoProveedor').value = data.id_proveedor || '';
                document.getElementById('productoPrecio').value = data.precio_unitario || '';
            } else if (sectionId === 'newCategoria') {
                document.getElementById('newCategoriaNombre').value = data.nombre || '';
                document.getElementById('newCategoriaDescripcion').value = data.descripcion || '';
            }
        })
        .catch(error => {
            console.error(`Error cargando ${sectionId} para edición:`, error);
            showNotification(`Error al cargar datos de ${sectionId}`, true);
        });
}

function deleteItem(sectionId, id) {
    if (confirm(`¿Estás seguro de eliminar este ${sectionId.slice(0, -1)}?`)) {
        console.log(`Eliminando ${sectionId} con ID: ${id}`);
        fetch(`/api/${sectionId}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                console.log(`Respuesta del servidor para DELETE /api/${sectionId}/${id}: ${response.status}`);
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                showNotification(data.message);
                filterTable(sectionId, true);
            })
            .catch(error => {
                console.error(`Error eliminando ${sectionId}:`, error);
                showNotification(`Error al eliminar ${sectionId.slice(0, -1)}`, true);
            });
    }
}

function validateForm(sectionId) {
    const inputs = {
        empleados: {
            nombre: { value: document.getElementById('empleadoNombre').value, minLength: 2 },
            correo: { value: document.getElementById('empleadoCorreo').value, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            telefono: { value: document.getElementById('empleadoTelefono').value, regex: /^\d{7,15}$/ },
            contrasena: { value: document.getElementById('empleadoContrasena').value, minLength: 6, required: !document.getElementById('empleadoId').value }
        },
        proveedores: {
            nombre: { value: document.getElementById('proveedorNombre').value, minLength: 2 },
            contacto: { value: document.getElementById('proveedorContacto').value, minLength: 2 },
            telefono: { value: document.getElementById('proveedorTelefono').value, regex: /^\d{7,15}$/ },
            correo: { value: document.getElementById('proveedorCorreo').value, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
        },
        categorias: {
            nombre: { value: document.getElementById('categoriaNombre')?.value || document.getElementById('newCategoriaNombre')?.value, minLength: 2 }
        },
        ubicaciones: {
            nombre: { value: document.getElementById('ubicacionNombre').value, minLength: 2 },
            direccion: { value: document.getElementById('ubicacionDireccion').value, minLength: 5 },
            tipo: { value: document.getElementById('ubicacionTipo').value, minLength: 2 }
        },
        roles: {
            nombre_rol: { value: document.getElementById('rolNombre').value, minLength: 2 }
        },
        movimiento: {
            cantidad: { value: document.getElementById('cantidad').value, minValue: 1 }
        },
        cambiarContrasena: {
            contrasenaActual: { value: document.getElementById('contrasenaActual').value, minLength: 6 },
            contrasenaNueva: { value: document.getElementById('contrasenaNueva').value, minLength: 6 }
        },
        productos: {
            nombre: { value: document.getElementById('productoNombre').value, minLength: 2 },
            codigo: { value: document.getElementById('productoCodigo').value, minLength: 1 },
            categoria: { value: document.getElementById('productoCategoria').value, required: true },
            proveedor: { value: document.getElementById('productoProveedor').value, required: true },
            precio: { value: document.getElementById('productoPrecio').value, minValue: 0 }
        },
        newCategoria: {
            nombre: { value: document.getElementById('newCategoriaNombre').value, minLength: 2 }
        }
    };

    const sectionData = inputs[sectionId];
    if (!sectionData) return null;
    for (let field in sectionData) {
        const { value, minLength, minValue, regex, required } = sectionData[field];
        if (required && !value) return `${field.charAt(0).toUpperCase() + field.slice(1)} es obligatorio`;
        if (minLength && value.length < minLength) return `${field.charAt(0).toUpperCase() + field.slice(1)} debe tener al menos ${minLength} caracteres`;
        if (minValue !== undefined && parseFloat(value) < minValue) return `${field.charAt(0).toUpperCase() + field.slice(1)} debe ser mayor o igual a ${minValue}`;
        if (regex && !regex.test(value)) return `${field.charAt(0).toUpperCase() + field.slice(1)} tiene un formato inválido`;
    }
    return null;
}

export { showAddForm, hideForm, editItem, deleteItem, validateForm };