// ============================================================================
// City Dude - Entry Point
// ============================================================================
// Initializes the game when the page loads.

import { Game } from './Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }

    const game = new Game(canvas);
    game.start();

    // Handle window resize for scaling
    function handleResize() {
        const container = document.getElementById('gameContainer');
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;
        const gameAspect = canvas.width / canvas.height;
        const windowAspect = windowW / windowH;

        let scale;
        if (windowAspect > gameAspect) {
            // Window is wider - fit to height
            scale = windowH / canvas.height;
        } else {
            // Window is taller - fit to width
            scale = windowW / canvas.width;
        }

        canvas.style.width = `${Math.floor(canvas.width * scale)}px`;
        canvas.style.height = `${Math.floor(canvas.height * scale)}px`;
    }

    window.addEventListener('resize', handleResize);
    handleResize();
});
