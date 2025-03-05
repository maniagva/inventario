function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.transform = 'translateY(20px)';
        section.style.opacity = '0';
    });
    const activeSection = document.getElementById(sectionId);
    activeSection.classList.add('active');
    setTimeout(() => {
        activeSection.style.transform = 'translateY(0)';
        activeSection.style.opacity = '1';
    }, 50);
}

function toggleTableLoader(tableId, show) {
    const loader = document.getElementById(`${tableId}Loader`);
    if (loader) loader.style.display = show ? 'block' : 'none';
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

export { showSection, toggleTableLoader, showNotification };