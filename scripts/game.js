document.addEventListener('DOMContentLoaded', () => {
    const wordsContainer = document.getElementById('words-container');
    const alphabetContainer = document.getElementById('alphabet-container');
    const viewScoreBtn = document.getElementById('view-score-btn');
    const scorePopup = document.getElementById('score-popup');
    const scoreDetails = document.getElementById('score-details');
    const closeScoreBtn = document.getElementById('close-score-btn');
  
    // Add Return to Menu button dynamically
    const returnBtn = document.createElement('button');
    returnBtn.id = 'return-to-menu-btn';
    returnBtn.textContent = 'Return to Menu';
    document.querySelector('.game-container').appendChild(returnBtn);
  
    // Load data from LocalStorage
    const gameSettings = JSON.parse(localStorage.getItem('gameSettings')) || {};
    const gameDictionary = JSON.parse(localStorage.getItem('gameDictionary')) || [];
    const wordCount = gameSettings.wordCount || 0;
  
    // Score tracking
    let score = { correct: 0, wrong: 0, totalAttempts: 0, wrongChars: [] };
  
    // Select random words from gameDictionary
    const selectedWords = selectRandomWords(gameDictionary, wordCount);
  
    // Default to 1 blank if no difficulty specified
    const maxBlanks = 1; // Adjust later when difficulty is added
  
    // Create all word items first but hide them
    const wordItems = [];
    
    if (selectedWords.length > 0) {
      selectedWords.forEach((entry) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.style.visibility = 'hidden'; // Hide initially
        
        const img = document.createElement('img');
        img.src = entry.image;
        img.onerror = () => { img.src = './assets/words_images/default.jpg'; };
        wordItem.appendChild(img);
  
        const wordSpan = document.createElement('span');
        const blankedWord = applyBlanks(entry, maxBlanks);
        wordSpan.innerHTML = blankedWord.display;
        wordItem.appendChild(wordSpan);
        
        wordsContainer.appendChild(wordItem);
        wordItems.push(wordItem);
      });
      
      // Wait for images to load before positioning
      Promise.all(
        Array.from(wordsContainer.querySelectorAll('img'))
          .map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
      ).then(() => {
        // Now position all items without overlap
        positionItemsWithoutOverlap(wordItems, wordsContainer);
      });
    } else {
      wordsContainer.innerHTML = '<p>No words available. Please add words in Creator Mode.</p>';
    }
  
    // Generate A-Z bubbles
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphabet.forEach(letter => {
      const letterDiv = document.createElement('div');
      letterDiv.className = 'letter';
      letterDiv.textContent = letter;
      letterDiv.draggable = true;
      letterDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', letter);
      });
      alphabetContainer.appendChild(letterDiv);
    });
  
    // Handle drag-and-drop
    wordsContainer.addEventListener('dragover', (e) => e.preventDefault());
    wordsContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const letter = e.dataTransfer.getData('text');
      const blank = e.target.closest('.blank');
      if (blank && blank.dataset.correct) {
        const isCorrect = letter.toLowerCase() === blank.dataset.correct;
        if (isCorrect) {
          blank.textContent = letter.toLowerCase(); // Place lowercase letter
          blank.classList.remove('blank');
          blank.classList.add('filled');
          updateScore(true, letter, blank.dataset.correct);
          showFeedback(true, blank);
        } else {
          updateScore(false, letter, blank.dataset.correct);
          showFeedback(false, blank);
        }
      }
    });
  
    // View score popup
    viewScoreBtn.addEventListener('click', () => {
      scoreDetails.innerHTML = `
        Correct Words: ${score.correct}<br>
        Wrong Attempts: ${score.wrong}<br>
        Total Attempts: ${score.totalAttempts}<br>
        Wrong Characters: ${score.wrongChars.join(', ') || 'None'}
      `;
      scorePopup.style.display = 'block';
    });
  
    closeScoreBtn.addEventListener('click', () => {
      scorePopup.style.display = 'none';
    });
  
    // Return to menu
    returnBtn.addEventListener('click', () => {
      window.location.href = './index.html';
    });
  
    // Helper: Select random words from dictionary
    function selectRandomWords(dict, count) {
      if (dict.length === 0 || count <= 0) return [];
      const shuffled = dict.slice().sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, dict.length));
    }
  
    // Helper: Apply blanks to word
    function applyBlanks(entry, maxBlanks) {
      let word = entry.word;
      let blanks = entry.blankType === 'manual' ? entry.blanks : getRandomBlanks(word, maxBlanks);
      let display = '';
      for (let i = 0; i < word.length; i++) {
        if (blanks.includes(i)) {
          display += `<span class="blank" data-correct="${word[i]}"></span>`;
        } else {
          display += word[i];
        }
      }
      return { display };
    }
  
    // Helper: Get random blank positions
    function getRandomBlanks(word, count) {
      const indices = Array.from({ length: word.length }, (_, i) => i);
      return indices.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, word.length));
    }
  
    // Helper: Show feedback
    function showFeedback(isCorrect, element) {
      const feedback = document.createElement('div');
      feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
      feedback.textContent = isCorrect ? '✓ Right Answer' : '✗ Wrong Answer';
      feedback.style.left = `${element.offsetLeft}px`;
      feedback.style.top = `${element.offsetTop - 30}px`;
      wordsContainer.appendChild(feedback);
      setTimeout(() => feedback.remove(), 1000);
    }
  
    // Helper: Update score
    function updateScore(isCorrect, guessed, correct) {
      score.totalAttempts++;
      if (isCorrect) {
        score.correct++;
      } else {
        score.wrong++;
        score.wrongChars.push(guessed);
      }
    }
  
    // IMPROVED: Position all items without overlap
    function positionItemsWithoutOverlap(items, container) {
      const placedRects = [];
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const padding = 10; // Minimum space between items
      
      items.forEach((item) => {
        // Get accurate dimensions after rendering
        const width = item.offsetWidth + padding;
        const height = item.offsetHeight + padding;
        
        // Try up to 100 random positions
        let positioned = false;
        let attempts = 0;
        let bestPosition = null;
        let minOverlap = Infinity;
        
        while (!positioned && attempts < 100) {
          attempts++;
          
          // Generate random position within container boundaries
          const x = Math.floor(Math.random() * (containerWidth - width));
          const y = Math.floor(Math.random() * (containerHeight - height));
          
          // Define current rect
          const currentRect = { x, y, width, height };
          
          // Check overlap with previously placed items
          let hasOverlap = false;
          let totalOverlap = 0;
          
          for (const rect of placedRects) {
            // Calculate overlap
            const xOverlap = Math.max(0, 
              Math.min(currentRect.x + currentRect.width, rect.x + rect.width) - 
              Math.max(currentRect.x, rect.x)
            );
            
            const yOverlap = Math.max(0,
              Math.min(currentRect.y + currentRect.height, rect.y + rect.height) - 
              Math.max(currentRect.y, rect.y)
            );
            
            const overlap = xOverlap * yOverlap;
            
            if (overlap > 0) {
              hasOverlap = true;
              totalOverlap += overlap;
            }
          }
          
          // If no overlap, we found a good position
          if (!hasOverlap) {
            positioned = true;
            placedRects.push(currentRect);
            
            // Set the position and make visible
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            item.style.visibility = 'visible';
          }
          // Keep track of position with minimal overlap for fallback
          else if (totalOverlap < minOverlap) {
            minOverlap = totalOverlap;
            bestPosition = { x, y };
          }
        }
        
        // If we couldn't find a non-overlapping position, use the best one we found
        if (!positioned) {
          if (bestPosition) {
            // Use position with minimal overlap
            item.style.left = `${bestPosition.x}px`;
            item.style.top = `${bestPosition.y}px`;
            placedRects.push({ 
              x: bestPosition.x, 
              y: bestPosition.y, 
              width, 
              height 
            });
          } else {
            // Last resort: grid-based positioning
            const index = placedRects.length;
            const cols = Math.ceil(Math.sqrt(items.length));
            const colWidth = containerWidth / cols;
            const rowHeight = 100;
            
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = col * colWidth + (colWidth - width) / 2;
            const y = row * rowHeight + 20;
            
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            placedRects.push({ x, y, width, height });
          }
          
          item.style.visibility = 'visible';
        }
      });
    }
  });