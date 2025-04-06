document.addEventListener('DOMContentLoaded', () => {
    const creatorBtn = document.getElementById('creator-mode-btn');
    const playerBtn = document.getElementById('player-mode-btn');

    creatorBtn.addEventListener('click', () => {
        window.location.href = './creator.html';  // Update this path
    });

    playerBtn.addEventListener('click', () => {
        window.location.href = './player.html';  // Update this path
    });
});
