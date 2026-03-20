// Display
const chessboard = document.getElementById("chessboard");

// RENDERING
function renderBoard() {
  chessboard.innerHTML = "";

  const whiteInCheck = isKingInCheck(PLAYERS.WHITE);
  const blackInCheck = isKingInCheck(PLAYERS.BLACK);
  const whiteKingPos = getKingPosition(PLAYERS.WHITE);
  const blackKingPos = getKingPosition(PLAYERS.BLACK);

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement("div");
      square.classList.add("square");

      const isDark = (row + col) % 2 === 1;
      square.classList.add(isDark ? "dark" : "light");

      square.textContent = board[row][col];
      square.dataset.row = row;
      square.dataset.col = col;

      if (isSelectedSquare(row, col)) {
        square.classList.add("selected");
      }

      if (isLegalMoveSquare(row, col)) {
        square.classList.add("legal-move");
      }

      const isWhiteCheckedKing =
        whiteInCheck &&
        whiteKingPos &&
        whiteKingPos.row === row &&
        whiteKingPos.col === col;

      const isBlackCheckedKing =
        blackInCheck &&
        blackKingPos &&
        blackKingPos.row === row &&
        blackKingPos.col === col;

      if (isWhiteCheckedKing || isBlackCheckedKing) {
        square.classList.add("check-king");
      }

      square.addEventListener("click", handleSquareClick);
      chessboard.appendChild(square);
    }
  }
}

function isSelectedSquare(row, col) {
  return (
    selectedSquare !== null &&
    selectedSquare.row === row &&
    selectedSquare.col === col
  );
}

function isLegalMoveSquare(row, col) {
  return legalMoves.some(move => move.row === row && move.col === col);
}

// INPUT HANDLING
function handleSquareClick(event) {
  const square = event.currentTarget;

  const row = parseInt(square.dataset.row, 10);
  const col = parseInt(square.dataset.col, 10);

  const clickedPiece = board[row][col];
  const clickedColor = getPieceColor(clickedPiece);

  if (selectedSquare === null) {
    if (!isEmptySquare(clickedPiece) && clickedColor === currentPlayer) {
      selectSquare(row, col);
      renderBoard();
    }
    return;
  }

  const fromRow = selectedSquare.row;
  const fromCol = selectedSquare.col;

  if (isSameSquare(row, col, fromRow, fromCol)) {
    clearSelection();
    renderBoard();
    return;
  }

  if (clickedColor === currentPlayer) {
    selectSquare(row, col);
    renderBoard();
    return;
  }

  if (!isLegalMove(fromRow, fromCol, row, col)) {
    return;
  }

  playMove(fromRow, fromCol, row, col);
}