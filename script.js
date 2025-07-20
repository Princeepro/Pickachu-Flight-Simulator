document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const jet = document.getElementById('jet');
    const scoreDisplay = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const jetFlapSound = new Audio('assets/jump.mp3'); 
    jetFlapSound.volume = 0.6;


    let jetY = gameContainer.offsetHeight / 2 - jet.offsetHeight / 2;
    let jetVelocity = 0;
    const gravity = 0.5;
    const lift = -8;

    let obstacles = [];
    let score = 0;
    let gameSpeed = 3;
    const initialObstacleGap = 220;
    let currentObstacleGap = initialObstacleGap;
    const obstacleSpawnInterval = 2000;
    let gameInterval;
    let obstacleSpawnTimer;
    let isGameOver = false;

    let backgroundX = 0;
    const backgroundScrollSpeed = 0.8;


    function setupGame() {
        jetY = gameContainer.offsetHeight / 2 - jet.offsetHeight / 2;
        jetVelocity = 0;
        obstacles = [];
        score = 0;
        gameSpeed = 3;
        currentObstacleGap = initialObstacleGap;
        scoreDisplay.textContent = 'Score: 0';
        isGameOver = false;
        jet.style.top = `${jetY}px`;

       
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

       
        backgroundX = 0;
        gameContainer.style.backgroundPosition = `0px 0px`;
    }


    function startGameLoops() {
       
        clearInterval(gameInterval);
        clearInterval(obstacleSpawnTimer);

        gameInterval = setInterval(gameLoop, 20);
        obstacleSpawnTimer = setInterval(spawnObstacle, obstacleSpawnInterval);
    }

    
    function showStartScreen() {
        startScreen.classList.remove('hidden');
        gameOverScreen.classList.add('hidden'); 
    }

    function hideStartScreen() {
        startScreen.classList.add('hidden');
    }

    
    function gameLoop() {
        if (isGameOver) return;

        
        jetVelocity += gravity;
        jetY += jetVelocity;

  
        if (jetY + jet.offsetHeight > gameContainer.offsetHeight) {
            jetY = gameContainer.offsetHeight - jet.offsetHeight;
            jetVelocity = 0;
            endGame(); 
        } else if (jetY < 0) {
            jetY = 0;
            jetVelocity = 0;
            endGame(); 
        }

        jet.style.top = `${jetY}px`;

      
        backgroundX -= backgroundScrollSpeed;
        gameContainer.style.backgroundPosition = `${backgroundX}px 0px`;

     
        obstacles.forEach((obstaclePair, index) => {
            const topObstacle = obstaclePair.top;
            const bottomObstacle = obstaclePair.bottom;

            let obstacleX = parseFloat(topObstacle.style.right) + gameSpeed;
            topObstacle.style.right = `${obstacleX}px`;
            bottomObstacle.style.right = `${obstacleX}px`;

      
            if (checkCollision(jet, topObstacle) || checkCollision(jet, bottomObstacle)) {
                endGame();
            }

            if (obstacleX > gameContainer.offsetWidth) {
                topObstacle.remove();
                bottomObstacle.remove();
                obstacles.splice(index, 1);
                score++;
                scoreDisplay.textContent = `Score: ${score}`;

                
                if (score % 5 === 0 && gameSpeed < 10) {
                    gameSpeed += 0.5;
                    if (currentObstacleGap > 120) {
                        currentObstacleGap -= 5;
                    }
                }
            }
        });
    }

  
    function spawnObstacle() {
        if (isGameOver) return;

        const containerHeight = gameContainer.offsetHeight;
        const obstacleWidth = 50;
        const minGapHeight = 80;
        const maxTopObstacleHeight = containerHeight - currentObstacleGap - minGapHeight;

        const topObstacleHeight = Math.random() * (maxTopObstacleHeight - minGapHeight) + minGapHeight;
        const bottomObstacleHeight = containerHeight - topObstacleHeight - currentObstacleGap;

        const topObstacle = document.createElement('div');
        topObstacle.classList.add('obstacle');
        topObstacle.style.height = `${topObstacleHeight}px`;
        topObstacle.style.top = '0';
        topObstacle.style.right = `${-obstacleWidth}px`;

        const bottomObstacle = document.createElement('div');
        bottomObstacle.classList.add('obstacle');
        bottomObstacle.style.height = `${bottomObstacleHeight}px`;
        bottomObstacle.style.bottom = '0';
        bottomObstacle.style.right = `${-obstacleWidth}px`;

        gameContainer.appendChild(topObstacle);
        gameContainer.appendChild(bottomObstacle);

        obstacles.push({ top: topObstacle, bottom: bottomObstacle });
    }


    function checkCollision(jetElement, obstacleElement) {
        const jetRect = jetElement.getBoundingClientRect();
        const obstacleRect = obstacleElement.getBoundingClientRect();
        const gameContainerRect = gameContainer.getBoundingClientRect();

        const jetLeft = jetRect.left - gameContainerRect.left;
        const jetRight = jetRect.right - gameContainerRect.left;
        const jetTop = jetRect.top - gameContainerRect.top;
        const jetBottom = jetRect.bottom - gameContainerRect.top;

        const obstacleLeft = obstacleRect.left - gameContainerRect.left;
        const obstacleRight = obstacleRect.right - gameContainerRect.left;
        const obstacleTop = obstacleRect.top - gameContainerRect.top;
        const obstacleBottom = obstacleRect.bottom - gameContainerRect.top;

        return jetRight > obstacleLeft &&
               jetLeft < obstacleRight &&
               jetBottom > obstacleTop &&
               jetTop < obstacleBottom;
    }

    
    function endGame() {
        isGameOver = true;
        clearInterval(gameInterval);
        clearInterval(obstacleSpawnTimer);
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
       
    }


    gameContainer.addEventListener('mousedown', () => {
        if (!isGameOver && startScreen.classList.contains('hidden')) { // Only fly if game is active and start screen is hidden
            jetVelocity = lift;
            jetFlapSound.currentTime = 0; // Rewind to the start
            jetFlapSound.play().catch(e => console.error("Error playing sound:", e)); // Play sound, catch potential errors
        }
    });
        

    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isGameOver && startScreen.classList.contains('hidden')) { // Only fly if game is active and start screen is hidden
            jetVelocity = lift;
            jetFlapSound.currentTime = 0; // Rewind to the start
            jetFlapSound.play().catch(e => console.error("Error playing sound:", e)); // Play sound, catch potential errors
        }
    });

 
    startButton.addEventListener('click', () => {
        setupGame();        
        hideStartScreen(); 
        startGameLoops();   
    });


    restartButton.addEventListener('click', () => {
        setupGame();       
        gameOverScreen.classList.add('hidden'); 
        startGameLoops();   
    });

    
    setupGame();
    showStartScreen(); 
});