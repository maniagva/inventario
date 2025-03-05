import { fetchData } from './api.js';

function loadFormOptions() {
    fetchData('/api/productos')
        .then(data => {
            const select = document.getElementById('productoSelect');
            select.innerHTML = '<option value="">Seleccione un producto</option>';
            data.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.id_producto;
                option.textContent = producto.nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando productos:', error));

    fetchData('/api/ubicaciones')
        .then(data => {
            const select = document.getElementById('ubicacionSelect');
            select.innerHTML = '<option value="">Seleccione una ubicación</option>';
            data.forEach(ubicacion => {
                const option = document.createElement('option');
                option.value = ubicacion.id_ubicacion;
                option.textContent = ubicacion.nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando ubicaciones:', error));

    fetchData('/api/roles')
        .then(data => {
            const select = document.getElementById('empleadoRol');
            select.innerHTML = '<option value="">Seleccione un rol</option>';
            data.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id_rol;
                option.textContent = rol.nombre_rol;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando roles:', error));

    fetchData('/api/categorias')
        .then(data => {
            const select = document.getElementById('productoCategoria');
            select.innerHTML = '<option value="">Seleccione una categoría</option>';
            data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id_categoria;
                option.textContent = categoria.nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando categorías:', error));

    fetchData('/api/proveedores')
        .then(data => {
            const select = document.getElementById('productoProveedor');
            select.innerHTML = '<option value="">Seleccione un proveedor</option>';
            data.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.id_proveedor;
                option.textContent = proveedor.nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando proveedores:', error));
}

export { loadFormOptions };