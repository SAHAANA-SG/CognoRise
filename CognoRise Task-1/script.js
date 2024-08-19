let gameBoard = Array.from(Array(9).keys());
let humanPlayer, aiPlayer, currentPlayer;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

const cells = document.querySelectorAll('.cell');

function selectSymbol(symbol) {
    humanPlayer = symbol;
    aiPlayer = symbol === 'X' ? 'O' : 'X';
    currentPlayer = 'X';
    document.getElementById('symbol-selection').classList.add('hidden');
    document.getElementById('board').classList.remove('hidden');
    startGame();
}

function startGame() {
    gameBoard = Array.from(Array(9).keys());
    currentPlayer = 'X';
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
    document.getElementById('result').classList.add('hidden');
    if (aiPlayer === 'X') {
        setTimeout(() => turn(bestSpot(), aiPlayer), 300);
    }
}

function turnClick(square) {
    if (typeof gameBoard[square.target.dataset.index] === 'number' && currentPlayer === humanPlayer) {
        turn(square.target.dataset.index, humanPlayer);
        if (!checkWinner(gameBoard, humanPlayer) && !checkTie()) {
            setTimeout(() => turn(bestSpot(), aiPlayer), 300);
        }
    }
}

function turn(squareId, player) {
    gameBoard[squareId] = player;
    document.querySelector(`.cell[data-index="${squareId}"]`).innerText = player;
    let gameWon = checkWinner(gameBoard, player);
    if (gameWon) {
        gameOver(gameWon);
    } else if (checkTie()) {
        gameOver({ index: -1, player: 'tie' });
    } else {
        currentPlayer = currentPlayer === humanPlayer ? aiPlayer : humanPlayer;
    }
}

function checkWinner(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winningCombinations.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winningCombinations[gameWon.index] || []) {
        document.querySelector(`.cell[data-index="${index}"]`).style.backgroundColor =
            gameWon.player === humanPlayer ? "blue" : "red";
    }
    for (let cell of cells) {
        cell.removeEventListener('click', turnClick, false);
    }
    displayResult(gameWon.player === humanPlayer ? "You win!" : 
                  gameWon.player === aiPlayer ? "AI wins!" : "It's a tie!");
}

function checkTie() {
    return emptySquares().length === 0;
}

function emptySquares() {
    return gameBoard.filter(s => typeof s === 'number');
}

function bestSpot() {
    return minimax(gameBoard, aiPlayer).index;
}

function displayResult(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.classList.remove('hidden');
}

function minimax(newBoard, player) {
    let availSpots = emptySquares();

    if (checkWinner(newBoard, humanPlayer)) {
        return {score: -10};
    } else if (checkWinner(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player === aiPlayer) {
            let result = minimax(newBoard, humanPlayer);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Add event listener for reset button
document.getElementById('reset-button').addEventListener('click', startGame);