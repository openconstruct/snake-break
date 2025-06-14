import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('snake-break.startGame', () => {
        const panel = vscode.window.createWebviewPanel(
            'snakeGame',
            'Snake Break',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent();
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Break</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #1e1e1e;
            color: #fff;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        #gameBoard {
            background-color: #000;
            border: 2px solid #333;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            line-height: 16px;
            white-space: pre;
            padding: 10px;
            margin: 20px 0;
        }
        
        #score {
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        #gameOver {
            font-size: 24px;
            color: #ff4444;
            margin: 20px 0;
            display: none;
        }
        
        #instructions {
            text-align: center;
            margin-top: 20px;
            color: #888;
        }
        
        button {
            background-color: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
        }
        
        button:hover {
            background-color: #005a9e;
        }
    </style>
</head>
<body>
    <h1>🐍 Snake Break</h1>
    <div id="score">Score: 0</div>
    <div id="gameBoard"></div>
    <div id="gameOver">Game Over! Press R to restart</div>
    <button onclick="startGame()">New Game</button>
    
    <div id="instructions">
        <p>Use WASD or Arrow Keys to move</p>
        <p>Eat the 0s to grow your snake!</p>
        <p>Press R to restart after game over</p>
    </div>

    <script>
        const BOARD_SIZE = 20;
        let board = [];
        let snake = [{x: 10, y: 10}];
        let direction = {x: 1, y: 0};
        let food = {x: 5, y: 5};
        let score = 0;
        let gameRunning = false;
        let gameInterval;

        function initBoard() {
            board = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
                board[i] = [];
                for (let j = 0; j < BOARD_SIZE; j++) {
                    board[i][j] = ' ';
                }
            }
        }

        function placeFood() {
            do {
                food.x = Math.floor(Math.random() * BOARD_SIZE);
                food.y = Math.floor(Math.random() * BOARD_SIZE);
            } while (isSnakePosition(food.x, food.y));
        }

        function isSnakePosition(x, y) {
            return snake.some(segment => segment.x === x && segment.y === y);
        }

        function updateBoard() {
            initBoard();
            
            // Place food
            board[food.y][food.x] = '0';
            
            // Place snake
            snake.forEach((segment, index) => {
                if (index === 0) {
                    board[segment.y][segment.x] = 'O'; // Head
                } else {
                    board[segment.y][segment.x] = 'o'; // Body
                }
            });
        }

        function renderBoard() {
            const boardElement = document.getElementById('gameBoard');
            let boardString = '';
            
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    boardString += board[i][j];
                }
                boardString += '\\n';
            }
            
            boardElement.textContent = boardString;
        }

        function moveSnake() {
            const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
            
            // Check wall collision
            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
                gameOver();
                return;
            }
            
            // Check self collision
            if (isSnakePosition(head.x, head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                document.getElementById('score').textContent = 'Score: ' + score;
                placeFood();
            } else {
                snake.pop();
            }
        }

        function gameOver() {
            gameRunning = false;
            clearInterval(gameInterval);
            document.getElementById('gameOver').style.display = 'block';
        }

        function startGame() {
            gameRunning = true;
            score = 0;
            snake = [{x: 10, y: 10}];
            direction = {x: 1, y: 0};
            document.getElementById('score').textContent = 'Score: 0';
            document.getElementById('gameOver').style.display = 'none';
            
            placeFood();
            
            gameInterval = setInterval(() => {
                if (gameRunning) {
                    moveSnake();
                    updateBoard();
                    renderBoard();
                }
            }, 150);
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!gameRunning && (e.key === 'r' || e.key === 'R')) {
                startGame();
                return;
            }
            
            if (!gameRunning) return;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    if (direction.y !== 1) direction = {x: 0, y: -1};
                    break;
                case 's':
                case 'arrowdown':
                    if (direction.y !== -1) direction = {x: 0, y: 1};
                    break;
                case 'a':
                case 'arrowleft':
                    if (direction.x !== 1) direction = {x: -1, y: 0};
                    break;
                case 'd':
                case 'arrowright':
                    if (direction.x !== -1) direction = {x: 1, y: 0};
                    break;
            }
        });

        // Start the game when page loads
        startGame();
    </script>
</body>
</html>`;
}

export function deactivate() {}