document.addEventListener('DOMContentLoaded', () => {
    const totalWordsSpan = document.getElementById('total-words');
    const wordCountInput = document.getElementById('word-count');
    const startBtn = document.getElementById('start-btn');
    const errorMsg = document.getElementById('error-msg');
  
    const dictionary = JSON.parse(localStorage.getItem('gameDictionary')) || [];
    const totalWords = dictionary.length;
    totalWordsSpan.textContent = totalWords;
  
    startBtn.addEventListener('click', () => {
      const selectedCount = parseInt(wordCountInput.value);
  
      if (!selectedCount || selectedCount < 1 || selectedCount > totalWords) {
        errorMsg.textContent = `Please enter a valid number of words (1 to ${totalWords}).`;
        return;
      }
  
      
  
      const gameSettings = {
        wordCount: selectedCount,
      };
      localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
  
      window.location.href = './game.html';
    });
  });

  const backBtn = document.getElementById('back-to-menu-btn');
backBtn.addEventListener('click', () => {
  window.location.href = './index.html'; // Change this path based on your project structure
});
