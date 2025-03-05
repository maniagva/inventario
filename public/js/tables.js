import { toggleTableLoader, showNotification } from './ui.js';

function loadTable(tableId, data, addActions = false) {
    const tbody = document.getElementById(`${tableId}Table`).querySelector('tbody');
    tbody.innerHTML = '';
    toggleTableLoader(tableId, false);
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        row.style.transition = 'all 0.4s ease';
        for (let key in item) {
            const cell = document.createElement('td');
            cell.textContent = item[key];
            row.appendChild(cell);
        }
        if (addActions) {
            const actionsCell = document.createElement('td');
            const idField = tableId === 'empleados' ? 'id_empleado' :
                           tableId === 'proveedores' ? 'id_proveedor' :
                           tableId === 'categorias' ? 'id_categoria' :
                           tableId === 'ubicaciones' ? 'id_ubicacion' :
                           tableId === 'productos' ? 'id_producto' : 'id_rol';
            actionsCell.innerHTML = `
                <button class="action-btn edit-btn" data-action="edit" data-table="${tableId}" data-id="${item[idField]}">Editar</button>
                <button class="action-btn delete-btn" data-action="delete" data-table="${tableId}" data-id="${item[idField]}">Eliminar</button>
            `;
            row.appendChild(actionsCell);
        }
        tbody.appendChild(row);
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

function filterTable(tableId, addActions = false) {
    const searchValue = document.getElementById(`search${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`).value.toLowerCase();
    toggleTableLoader(tableId, true);
    fetch(`/api/${tableId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(response => response.json())
        .then(data => {
            const filteredData = data.filter(item => 
                Object.values(item).some(value => String(value).toLowerCase().includes(searchValue))
            );
            loadTable(tableId, filteredData, addActions);
        })
        .catch(error => {
            console.error(`Error filtrando ${tableId}:`, error);
            toggleTableLoader(tableId, false);
            showNotification(`Error al cargar ${tableId}`, true);
        });
}

function exportToCSV(tableId, filename) {
    const table = document.getElementById(`${tableId}Table`);
    const rows = table.querySelectorAll('tr');
    let csv = [];
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td:not(:last-child)');
        const rowData = Array.from(cols).map(col => `"${col.textContent.replace(/"/g, '""')}"`).join(',');
        csv.push(rowData);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export { loadTable, filterTable, exportToCSV };