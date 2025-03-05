async function fetchData(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            if (response.status === 401) throw new Error('Acceso denegado. Por favor inicia sesión nuevamente.');
            if (response.status === 403) throw new Error('No tienes permiso para realizar esta acción.');
            const errordata = await response.json();
            throw new Error(errordata.message || 'Error ${response.status}: ${response.statusText}');
        }
        return response.json();
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
}

export { fetchData };