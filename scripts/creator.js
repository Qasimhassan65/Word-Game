document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('word-input');
    const randomBlanks = document.getElementById('random-blanks');
    const manualBlanks = document.getElementById('manual-blanks');
    const manualBlanksContainer = document.getElementById('manual-blanks-container');
    const manualBlankOptions = document.getElementById('manual-blank-options');
    const saveWordBtn = document.getElementById('save-word-btn');
    const wordList = document.getElementById('word-list');
    const backBtn = document.getElementById('back-to-main-btn');
    const imageInput = document.getElementById('image-input');

    // Load dictionary from LocalStorage or initialize as empty array
    let dictionary = JSON.parse(localStorage.getItem('gameDictionary')) || [];

    // Display existing dictionary on page load
    updateWordList();

    // Show/hide manual blanks container based on radio selection
    randomBlanks.addEventListener('change', () => {
        manualBlanksContainer.style.display = 'none';
        manualBlankOptions.innerHTML = '';
    });

    manualBlanks.addEventListener('change', () => {
        manualBlanksContainer.style.display = 'block';
        updateManualBlankOptions();
    });

    // Convert input to lowercase as the user types
    wordInput.addEventListener('input', () => {
        wordInput.value = wordInput.value.toLowerCase(); // force lowercase input
        if (manualBlanks.checked) {
            updateManualBlankOptions();
        }
    });

    // Save word to dictionary and LocalStorage
    saveWordBtn.addEventListener('click', () => {
        const word = wordInput.value.trim().toLowerCase();
        let blanks = [];

        if (!word) {
            alert('Please enter a word.');
            return;
        }

        if (manualBlanks.checked) {
            const checkboxes = manualBlankOptions.querySelectorAll('input[type="checkbox"]:checked');
            blanks = Array.from(checkboxes).map(cb => parseInt(cb.value));
        }

        // Get the image path from the image input or use default path
        const imagePath = imageInput.value 
            ? `./assets/words_images/` + imageInput.value 
            : `./assets/words_images/${word}.png`; // use custom path or default

        dictionary.push({
            word,
            image: imagePath,
            blankType: randomBlanks.checked ? 'random' : 'manual',
            blanks
        });

        saveDictionaryToStorage();
        updateWordList(); // Update the entire list to ensure indices are correct
        wordInput.value = '';
        imageInput.value = ''; // Clear image input
        manualBlankOptions.innerHTML = '';
        manualBlanksContainer.style.display = 'none';
        randomBlanks.checked = true;
    });

    // Back to main menu
    backBtn.addEventListener('click', () => {
        window.location.href = './index.html';
    });

    // Helper: Update manual blank options
    function updateManualBlankOptions() {
        const word = wordInput.value.trim();
        manualBlankOptions.innerHTML = '';

        if (word) {
            word.split('').forEach((letter, index) => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `blank-${index}`;
                checkbox.value = index;

                const label = document.createElement('label');
                label.htmlFor = `blank-${index}`;
                label.textContent = letter.toLowerCase(); // ensure label stays lowercase

                manualBlankOptions.appendChild(checkbox);
                manualBlankOptions.appendChild(label);
            });
        }
    }

    // Helper: Update the entire word list display
    function updateWordList() {
        wordList.innerHTML = '';
        dictionary.forEach((entry, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            li.textContent = `${entry.word} (${entry.blankType}${entry.blanks.length ? ': ' + entry.blanks.join(', ') : ''})`;

            const img = document.createElement('img');
            img.src = entry.image;
            img.style.maxWidth = '50px';
            img.onerror = () => { img.src = './assets/words_images/error.png'; };
            li.appendChild(img);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-btn';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                removeWord(parseInt(li.dataset.index));
            });
            li.appendChild(removeBtn);

            wordList.appendChild(li);
        });
    }

    // Helper: Remove word from dictionary and update display
    function removeWord(index) {
        if (index >= 0 && index < dictionary.length) {
            dictionary.splice(index, 1);
            saveDictionaryToStorage();
            updateWordList(); // Refresh the entire list to ensure indices are correct
        }
    }

    // Helper: Save dictionary to LocalStorage
    function saveDictionaryToStorage() {
        localStorage.setItem('gameDictionary', JSON.stringify(dictionary));
    }
});