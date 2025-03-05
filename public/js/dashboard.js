import { showNotification } from './ui.js';

function loadDashboard() {
    const rol = localStorage.getItem('rol');
    if (rol === 'Administrador' || rol === 'Auditor' || rol === 'Supervisor') {
        fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Verificar si los datos existen
                if (!data || typeof data !== 'object') {
                    throw new Error('Datos del dashboard inválidos');
                }

                // Actualizar valores en el DOM, manejando valores nulos o indefinidos
                document.getElementById('totalProductos').textContent = data.totalProductos || 0;
                document.getElementById('movimientosHoy').textContent = data.movimientosHoy || 0;
                document.getElementById('stockCritico').textContent = data.stockCritico || 0;

                // Manejar stockPorCategoria, asumiendo que puede ser undefined o null
                const stockPorCategoria = Array.isArray(data.stockPorCategoria) ? data.stockPorCategoria : [];

                const ctx = document.getElementById('stockChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: stockPorCategoria.map(item => item.categoria || 'Sin categoría'),
                        datasets: [{
                            label: 'Stock por Categoría',
                            data: stockPorCategoria.map(item => item.stock || 0),
                            backgroundColor: '#007bff',
                            borderColor: '#0056b3',
                            borderWidth: 1
                        }]
                    },
                    options: { 
                        scales: { 
                            y: { 
                                beginAtZero: true,
                                title: { display: true, text: 'Stock' }
                            },
                            x: { 
                                title: { display: true, text: 'Categorías' }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error cargando dashboard:', error);
                showNotification('Error al cargar dashboard. Intente de nuevo más tarde.', true);
            });
    }
}

export { loadDashboard };