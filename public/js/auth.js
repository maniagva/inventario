if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('correo');
    window.location.href = '/login.html';
}

export { logout };