const teamOne = document.getElementById('teamOne');
const firstPlayer = document.getElementById('firstPlayer'); 
const teamTwo = document.getElementById('teamTwo');
const appContainer = document.getElementById('appContainer');
const secondPlayer = document.getElementById('secondPlayer'); 
const scoreOneDisplay = document.getElementById('scoreOne');
const scoreTwoDisplay = document.getElementById('scoreTwo');
const modal = document.getElementById('noteModal');
const closeBtn = document.getElementsByClassName('close')[0];
const noteText = document.getElementById('noteText');
const saveNoteBtn = document.getElementById('saveNote');
const buttonDivOne = document.getElementById('buttonDivOne');
const buttonDivTwo = document.getElementById('buttonDivTwo');
const categoryInput = document.getElementById('categoryInput');
const categoryButton = document.getElementById('categoryButton');
const categoryList = document.getElementById('categoryList');

let currentButton;
let scoreOne = 0;
let scoreTwo = 0;
let totalScoreOne = 0;
let totalScoreTwo = 0;
let currentGameId = null;

appContainer.style.display = 'none';

function loadExistingGame() {
    const gameId = localStorage.getItem('currentGameId');
    if (gameId) {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const game = games.find(g => g.id === parseInt(gameId));
        if (game) {
            teamOne.value = game.teamOne;
            teamTwo.value = game.teamTwo;
            categoryInput.value = game.category;
            currentGameId = game.id;
            totalScoreOne = game.scoreOne;
            totalScoreTwo = game.scoreTwo;
            showPlayer();
            updateScoreDisplay(scoreOneDisplay, totalScoreOne);
            updateScoreDisplay(scoreTwoDisplay, totalScoreTwo);
            restoreButtonStates(game.buttonStates, game.notes);
            localStorage.removeItem('currentGameId');
        }
    }
}

function createGameBoard() {
    for (let i = 0; i < 5; i++) {
        const buttonOne = document.createElement('button');
        buttonOne.className = 'buttonsOne';
        buttonOne.setAttribute('data-state', '0');
        buttonDivOne.appendChild(buttonOne);

        const buttonTwo = document.createElement('button');
        buttonTwo.className = 'buttonsTwo';
        buttonTwo.setAttribute('data-state', '0');
        buttonDivTwo.appendChild(buttonTwo);
    }

    const addButtonsOne = document.querySelectorAll('.buttonsOne');
    addButtonsOne.forEach(button => {
        button.addEventListener('click', addCourt);
        button.addEventListener('click', () => checkScore('One'));
        button.addEventListener('dblclick', openNoteModal);
    });

    const addButtonsTwo = document.querySelectorAll('.buttonsTwo');
    addButtonsTwo.forEach(button => {
        button.addEventListener('click', addCourt);
        button.addEventListener('click', () => checkScore('Two'));
        button.addEventListener('dblclick', openNoteModal);
    });
}

function showPlayer() {
    const category = categoryInput.value.trim();
    if (!teamOne.value || !teamTwo.value || !category) {
        alert("Please enter both team names and select a category.");
        return;
    }
    firstPlayer.innerText = teamOne.value;
    secondPlayer.innerText = teamTwo.value;
    document.getElementById('teamNames').style.display = 'none';
    appContainer.style.display = 'block';
    createGameBoard();
    
    if (!currentGameId) {
        currentGameId = Date.now();
        const newGame = {
            id: currentGameId,
            teamOne: teamOne.value,
            teamTwo: teamTwo.value,
            category: category,
            scoreOne: 0,
            scoreTwo: 0,
            buttonStates: Array(10).fill(0),
            notes: Array(10).fill('')
        };
        let games = JSON.parse(localStorage.getItem('games')) || [];
        games.push(newGame);
        localStorage.setItem('games', JSON.stringify(games));
    }
}

function updateScoreDisplay(scoreDisplay, score) {
    scoreDisplay.innerText = score;
    scoreDisplay.style.display = 'inline-flex';
}

function checkScore(team) {
    let colorCount = 0;
    const buttons = document.querySelectorAll(`.buttons${team}`);
    buttons.forEach(button => {
        const color = window.getComputedStyle(button).backgroundColor;
        if (color === 'rgb(0, 255, 255)') {
            colorCount++;
        }
    });
    
    if (team === 'One') {
        scoreOne = colorCount;
        totalScoreOne = Math.floor(totalScoreOne / 5) * 5 + scoreOne;
        updateScoreDisplay(scoreOneDisplay, totalScoreOne);
    } else {
        scoreTwo = colorCount;
        totalScoreTwo = Math.floor(totalScoreTwo / 5) * 5 + scoreTwo;
        updateScoreDisplay(scoreTwoDisplay, totalScoreTwo);
    }
    
    if (colorCount === 5) {
        clearButtons(team);
    }

    updateGameState();
}

function clearButtons(team) {
    const buttons = document.querySelectorAll(`.buttons${team}`);
    buttons.forEach(button => {
        const noteCloud = button.querySelector('.note-cloud');
        if (noteCloud) {
            noteCloud.remove();
        }
        button.style.backgroundColor = 'rgb(240, 240, 240)';
        button.setAttribute('data-state', '0');
    });
    if (team === 'One') {
        scoreOne = 0;
    } else {
        scoreTwo = 0;
    }
}

function resetValue() {
    document.querySelectorAll('.buttonsOne, .buttonsTwo').forEach(button => {
        const noteCloud = button.querySelector('.note-cloud');
        if (noteCloud) {
            noteCloud.remove();
        }
        button.style.backgroundColor = 'rgb(240, 240, 240)';
        button.setAttribute('data-state', '0');
    });
    scoreOne = 0;
    scoreTwo = 0;
    totalScoreOne = 0;
    totalScoreTwo = 0;
    updateScoreDisplay(scoreOneDisplay, totalScoreOne);
    updateScoreDisplay(scoreTwoDisplay, totalScoreTwo);

    updateGameState();
}

function addCourt(event) {
    if (event.target.classList.contains('note-cloud')) {
        return;
    }

    const clickedButton = event.currentTarget;
    const noteCloud = clickedButton.querySelector('.note-cloud');

    if (noteCloud) {
        return;
    }

    const currentState = parseInt(clickedButton.getAttribute('data-state'));

    if (currentState % 2 === 0) {
        clickedButton.style.backgroundColor = 'rgb(0, 255, 255)';
        clickedButton.setAttribute('data-state', '1');
    } else {
        clickedButton.style.backgroundColor = 'rgb(240, 240, 240)';
        clickedButton.setAttribute('data-state', '0');
    }
}

function openNoteModal(event) {
    event.stopPropagation();
    currentButton = event.currentTarget;
    const existingNote = currentButton.querySelector('.note-cloud');
    if (existingNote) {
        noteText.value = existingNote.title;
    } else {
        noteText.value = '';
    }
    modal.style.display = 'block';
}

function closeNoteModal() {
    modal.style.display = 'none';
}

function saveNote() {
    const note = noteText.value.trim();
    if (note) {
        let noteCloud = currentButton.querySelector('.note-cloud');
        if (!noteCloud) {
            noteCloud = document.createElement('div');
            noteCloud.className = 'note-cloud';
            currentButton.appendChild(noteCloud);
            noteCloud.addEventListener('click', function(event) {
                event.stopPropagation();
                openNoteModal({currentTarget: currentButton, stopPropagation: () => {}});
            });
        }
        noteCloud.textContent = note.substring(0, 10) + (note.length > 10 ? '...' : '');
        noteCloud.title = note;
        
        currentButton.style.backgroundColor = 'rgb(0, 255, 255)';
        currentButton.setAttribute('data-state', '1');
    } else {
        const existingNote = currentButton.querySelector('.note-cloud');
        if (existingNote) {
            existingNote.remove();
            currentButton.style.backgroundColor = 'rgb(240, 240, 240)';
            currentButton.setAttribute('data-state', '0');
        }
    }
    closeNoteModal();
    if (currentButton.classList.contains('buttonsOne')) {
        checkScore('One');
    } else {
        checkScore('Two');
    }
}

function updateGameState() {
    if (currentGameId) {
        let games = JSON.parse(localStorage.getItem('games')) || [];
        const gameIndex = games.findIndex(game => game.id === currentGameId);
        if (gameIndex !== -1) {
            games[gameIndex].scoreOne = totalScoreOne;
            games[gameIndex].scoreTwo = totalScoreTwo;
            games[gameIndex].buttonStates = getButtonStates();
            games[gameIndex].notes = getNotes();
            localStorage.setItem('games', JSON.stringify(games));
        }
    }
}

function getButtonStates() {
    const buttons = [...document.querySelectorAll('.buttonsOne'), ...document.querySelectorAll('.buttonsTwo')];
    return buttons.map(button => button.getAttribute('data-state'));
}

function getNotes() {
    const buttons = [...document.querySelectorAll('.buttonsOne'), ...document.querySelectorAll('.buttonsTwo')];
    return buttons.map(button => {
        const noteCloud = button.querySelector('.note-cloud');
        return noteCloud ? noteCloud.title : '';
    });
}

function restoreButtonStates(states, notes) {
    const buttons = [...document.querySelectorAll('.buttonsOne'), ...document.querySelectorAll('.buttonsTwo')];
    buttons.forEach((button, index) => {
        if (states[index] === '1') {
            button.style.backgroundColor = 'rgb(0, 255, 255)';
            button.setAttribute('data-state', '1');
        } else {
            button.style.backgroundColor = 'rgb(240, 240, 240)';
            button.setAttribute('data-state', '0');
        }
        
        // Restore notes
        if (notes && notes[index]) {
            let noteCloud = button.querySelector('.note-cloud');
            if (!noteCloud) {
                noteCloud = document.createElement('div');
                noteCloud.className = 'note-cloud';
                button.appendChild(noteCloud);
                noteCloud.addEventListener('click', function(event) {
                    event.stopPropagation();
                    openNoteModal({currentTarget: button, stopPropagation: () => {}});
                });
            }
            noteCloud.textContent = notes[index].substring(0, 10) + (notes[index].length > 10 ? '...' : '');
            noteCloud.title = notes[index];
        }
    });
}

function populateCategoryList() {
    const categories = JSON.parse(localStorage.getItem('categories')) || ['All', 'FIFA', 'Cards', 'Chess', 'Board Games', '1 v 1\'s', 'Charades', 'Team vs Team'];
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        li.addEventListener('click', () => {
            categoryInput.value = category;
            toggleCategoryDropdown();
        });
        categoryList.appendChild(li);
    });
}

function toggleCategoryDropdown() {
    categoryList.classList.toggle('show');
}

function addNewCategory() {
    const newCategory = prompt("Enter a new category:");
    if (newCategory && newCategory.trim()) {
        let categories = JSON.parse(localStorage.getItem('categories')) || ['All', 'FIFA', 'Cards', 'Chess', 'Board Games', '1 v 1\'s', 'Charades', 'Team vs Team'];
        if (!categories.includes(newCategory)) {
            categories.push(newCategory);
            localStorage.setItem('categories', JSON.stringify(categories));
            populateCategoryList();
            categoryInput.value = newCategory;
            alert('New category added successfully!');
        } else {
            alert('This category already exists!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadExistingGame();
    populateCategoryList();
});

document.getElementById('buttonSubmit').addEventListener('click', showPlayer);

const reset = document.getElementById('resetButton');
reset.addEventListener('click', resetValue);

closeBtn.addEventListener('click', closeNoteModal);
saveNoteBtn.addEventListener('click', saveNote);
categoryButton.addEventListener('click', toggleCategoryDropdown);

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeNoteModal();
    }
    if (!event.target.matches('#categoryInput') && !event.target.matches('#categoryButton') && !event.target.matches('#categoryButton svg')) {
        categoryList.classList.remove('show');
    }
});

window.addEventListener('beforeunload', updateGameState);