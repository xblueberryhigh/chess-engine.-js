//Display
const chessboard = document.getElementById("chessboard");


//RENDERING
function renderBoard() {
  chessboard.innerHTML = "";

  const whiteInCheck = isKingInCheck("white");
  const blackInCheck = isKingInCheck("black");
  const whiteKingPos = findKing("white");
  const blackKingPos = findKing("black");

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
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

      if (
        whiteInCheck &&
        whiteKingPos &&
        whiteKingPos.row === row &&
        whiteKingPos.col === col
      ) {
        square.classList.add("check-king");
      }

      if (
        blackInCheck &&
        blackKingPos &&
        blackKingPos.row === row &&
        blackKingPos.col === col
      ) {
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
function isLegalMoveSquare(row, col){
  return legalMoves.some(move => move.row === row && move.col === col);
}

//INPUT HANDLING
function handleSquareClick(event) {
  const square = event.currentTarget;

  const row = parseInt(square.dataset.row, 10);
  const col = parseInt(square.dataset.col, 10);

  const clickedPiece = board[row][col];
  const clickedColor = getPieceColor(clickedPiece);

  console.log("Clicked:", row, col, "piece:", clickedPiece);

  // First click: select one of current player's pieces
  if (selectedSquare === null) {
    if (clickedPiece !== "" && clickedColor === currentPlayer) {
      selectSquare(row, col);
      renderBoard();
    }
    return;
  }

  const fromRow = selectedSquare.row;
  const fromCol = selectedSquare.col;

  // Click same square: deselect
  if (row === fromRow && col === fromCol) {
    clearSelection();
    renderBoard();
    return;
  }

  // Click another one of your own pieces: switch selection
  if (clickedColor === currentPlayer) {
    selectSquare(row, col);
    renderBoard();
    return;
  }

  // Try move only if legal
  if (!isLegalMove(fromRow, fromCol, row, col)) {
    return;
  }

  playMove(fromRow, fromCol, row, col);
}