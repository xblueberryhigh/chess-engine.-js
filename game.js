//Apply moves

// MOVE
function playMove(fromRow, fromCol, toRow, toCol){
  
  updateCastlingRights(fromRow, fromCol, toRow, toCol);
  movePiece(fromRow, fromCol, toRow, toCol);
  updateEnPassantState(fromRow, fromCol, toRow, toCol);
  evalScore = computeMaterial();
  console.log(evalScore);

  clearSelection();
  switchPlayer();
  renderBoard();

  if (isCheckmate(currentPlayer)) {
    console.log(`Checkmate! ${currentPlayer} loses.`);
  } else if (isStalemate(currentPlayer)) {
    console.log("Stalemate!");
  }
}
function movePiece(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const movingPieceColor = getPieceColor(piece);
  const targetPiece = board[toRow][toCol];

  if (isCastlingMove(fromRow, fromCol, toRow, toCol)) {
    doCastle(fromRow, fromCol, toRow, toCol);
    return;
  }

  //En passant
  if (isEnPassantMove(fromRow, fromCol, toRow, toCol)) {
    const capturedPawn = board[enPassantTarget.captureRow][enPassantTarget.captureCol];

    if (capturedPawn !== "") {
      storeCapturedPiece(movingPieceColor, capturedPawn);
    }

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = "";
    board[enPassantTarget.captureRow][enPassantTarget.captureCol] = "";

    handlePromotion(toRow, toCol);
    return;
  }
  // Normal capture
  if (targetPiece !== "") {
    storeCapturedPiece(movingPieceColor, targetPiece);
  }

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = "";

  handlePromotion(toRow, toCol);
}
function switchPlayer() {
  currentPlayer = currentPlayer === "white" ? "black" : "white";
}
function handlePromotion(row, col) {
  const piece = board[row][col];

  if (piece === "♙" && row === 0) {
    board[row][col] = "♕"; // white promotes
  }

  if (piece === "♟" && row === 7) {
    board[row][col] = "♛"; // black promotes
  }
}
function storeCapturedPiece(movingPieceColor, targetPiece) {
  if (movingPieceColor === "white") {
    whiteCaptured.push(targetPiece);
  } else {
    blackCaptured.push(targetPiece);
  }
}

//SELECTION
function selectSquare(row, col) {
  selectedSquare = { row, col };
  legalMoves = getLegalMoves(row, col);
}
function clearSelection() {
  selectedSquare = null;
  legalMoves = [];
}