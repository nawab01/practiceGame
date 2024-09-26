document.addEventListener('DOMContentLoaded', () => {
    const gameList = document.getElementById('gameList');
    const tabWrapper = document.querySelector('.tab-wrapper');

    function getGames() {
        return JSON.parse(localStorage.getItem('games')) || [];
    }

    function getCategories() {
        return JSON.parse(localStorage.getItem('categories')) || ['All', 'FIFA', 'Cards', 'Chess', 'Board Games', '1 v 1\'s', 'Charades', 'Team vs Team'];
    }

    function displayCategories() {
        const categories = getCategories();
        tabWrapper.innerHTML = '';
        categories.forEach((category, index) => {
            const tab = document.createElement('button');
            tab.classList.add('tab');
            if (index === 0) tab.classList.add('active');
            tab.setAttribute('data-category', category.toLowerCase());
            tab.textContent = category;
            tab.addEventListener('click', (event) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                event.target.classList.add('active');
                displayGames(category.toLowerCase());
            });
            tabWrapper.appendChild(tab);
        });
    }

    function displayGames(category) {
        gameList.innerHTML = '';
        const games = getGames();
        const filteredGames = category.toLowerCase() === 'all' ? games : games.filter(game => game.category.toLowerCase() === category.toLowerCase());
        filteredGames.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.classList.add('gameItem');
            gameItem.textContent = `${game.teamOne} vs ${game.teamTwo} - ${game.scoreOne}:${game.scoreTwo}`;
            
            addInteractionListeners(gameItem, game.id);
            
            gameList.appendChild(gameItem);
        });
    }

    function loadGame(gameId) {
        localStorage.setItem('currentGameId', gameId);
        window.location.href = 'gameboard.html';
    }

    function deleteGame(gameId) {
        let games = getGames();
        games = games.filter(game => game.id !== gameId);
        localStorage.setItem('games', JSON.stringify(games));
        const activeCategory = document.querySelector('.tab.active').getAttribute('data-category');
        displayGames(activeCategory);
    }

    function addInteractionListeners(gameItem, gameId) {
        let startX, startY;
        const swipeThreshold = 100;
        let isScrolling = false;

        function handleStart(e) {
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            isScrolling = false;
        }

        function handleMove(e) {
            if (!startX || !startY) return;

            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = Math.abs(startY - currentY);

            // Check if the user is scrolling vertically
            if (diffY > 10 && diffY > Math.abs(diffX)) {
                isScrolling = true;
                return;
            }

            // If not scrolling and swiping left, handle the swipe
            if (!isScrolling && diffX > 0) {
                e.preventDefault();
                gameItem.style.transform = `translateX(-${Math.min(diffX, swipeThreshold)}px)`;
                gameItem.style.opacity = 1 - (diffX / swipeThreshold);
            }
        }

        function handleEnd(e) {
            if (!startX) return;

            const endX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (!isScrolling) {
                if (diffX > swipeThreshold) {
                    gameItem.style.transform = `translateX(-${window.innerWidth}px)`;
                    gameItem.style.opacity = '0';
                    setTimeout(() => deleteGame(gameId), 300);
                } else if (diffX < 10) {
                    // Treat as a click if the movement is very small
                    loadGame(gameId);
                } else {
                    // Reset the item's position if swipe wasn't far enough
                    gameItem.style.transform = 'translateX(0)';
                    gameItem.style.opacity = '1';
                }
            }

            startX = null;
            startY = null;
        }

        gameItem.addEventListener('touchstart', handleStart, { passive: true });
        gameItem.addEventListener('touchmove', handleMove, { passive: false });
        gameItem.addEventListener('touchend', handleEnd);

        // For desktop testing
        gameItem.addEventListener('mousedown', handleStart);
        gameItem.addEventListener('mousemove', handleMove);
        gameItem.addEventListener('mouseup', handleEnd);
        gameItem.addEventListener('mouseleave', handleEnd);
    }

    displayCategories();
    displayGames('all');

    // Implement drag scrolling for category tabs
    let isDown = false;
    let startX;
    let scrollLeft;

    tabWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - tabWrapper.offsetLeft;
        scrollLeft = tabWrapper.scrollLeft;
    });

    tabWrapper.addEventListener('mouseleave', () => {
        isDown = false;
    });

    tabWrapper.addEventListener('mouseup', () => {
        isDown = false;
    });

    tabWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabWrapper.offsetLeft;
        const walk = (x - startX) * 3;
        tabWrapper.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    tabWrapper.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - tabWrapper.offsetLeft;
        scrollLeft = tabWrapper.scrollLeft;
    }, { passive: true });

    tabWrapper.addEventListener('touchend', () => {
        isDown = false;
    });

    tabWrapper.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - tabWrapper.offsetLeft;
        const walk = (x - startX) * 3;
        tabWrapper.scrollLeft = scrollLeft - walk;
    }, { passive: false });
});