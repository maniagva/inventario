import { toggleTableLoader, showNotification } from './ui.js';
import { exportToCSV } from './tables.js';

function loadReporte(tipo) {
    toggleTableLoader('reportes', true);
    fetch(`/api/reportes/${tipo}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(response => response.json())
        .then(data => {
            const thead = document.getElementById('reportesHead');
            const tbody = document.getElementById('reportesBody');
            thead.innerHTML = '';
            tbody.innerHTML = '';
            toggleTableLoader('reportes', false);

            let headers = tipo === 'stock_bajo' ? ['ID', 'Producto', 'Ubicación', 'Stock'] : ['ID', 'Producto', 'Ubicación', 'Empleado', 'Tipo', 'Cantidad', 'Fecha'];
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tr.appendChild(th);
            });
            thead.appendChild(tr);

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
                tbody.appendChild(row);
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, index * 150);
            });

            const existingBtn = document.getElementById('reportesExportBtn');
            if (existingBtn) existingBtn.remove();

            const exportBtn = document.createElement('button');
            exportBtn.id = 'reportesExportBtn';
            exportBtn.textContent = 'Exportar a CSV';
            exportBtn.className = 'action-btn';
            exportBtn.style.marginTop = '10px';
            exportBtn.addEventListener('click', () => exportToCSV('reportes', tipo));
            document.getElementById('reportes').appendChild(exportBtn);
        })
        .catch(error => {
            console.error('Error cargando reporte:', error);
            toggleTableLoader('reportes', false);
            showNotification('Error al cargar reporte', true);
        });
}

export { loadReporte };