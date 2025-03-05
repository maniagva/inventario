import { initializeParticles } from './ui.js';
import { setupEventListeners } from './events.js';
import { loadInitialData } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeParticles();
    setupEventListeners();
    loadInitialData();
});