function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
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
    setTimeout(() => notification.classList.add('visible'), 10);
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initializeParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: '#adb5bd' },
            shape: { type: 'circle' },
            opacity: { value: 0.3, random: true },
            size: { value: 2, random: true },
            line_linked: { enable: false },
            move: { speed: 1, direction: 'none', random: true }
        },
        interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false } } },
        retina_detect: true
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('page-loader').classList.add('hidden');
        }, 500);
    });
}

export { showSection, toggleTableLoader, showNotification, initializeParticles };