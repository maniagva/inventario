async function fetchData(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: { 
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
        }
    };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

export { fetchData };