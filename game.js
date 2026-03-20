// Apply moves

// MOVE
function playMove(fromRow, fromCol, toRow, toCol) {
  updateCastlingRights(fromRow, fromCol, toRow, toCol);
  movePiece(fromRow, fromCol, toRow, toCol);
  updateEnPassantState(fromRow, fromCol, toRow, toCol);

  evalScore = computeMaterial();

  clearSelection();
  switchPlayer();
  renderBoard();

  logGameState();
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const movingPieceColor = getPieceColor(piece);
  const targetPiece = board[toRow][toCol];

  if (isCastlingMove(fromRow, fromCol, toRow, toCol)) {
    doCastle(fromRow, fromCol, toRow, toCol);
    return;
  }

  if (isEnPassantMove(fromRow, fromCol, toRow, toCol)) {
    const capturedPawn = board[enPassantTarget.captureRow][enPassantTarget.captureCol];

    if (!isEmptySquare(capturedPawn)) {
      storeCapturedPiece(movingPieceColor, capturedPawn);
    }

    relocatePiece(fromRow, fromCol, toRow, toCol);
    board[enPassantTarget.captureRow][enPassantTarget.captureCol] = EMPTY_SQUARE;

    promoteIfNeeded(toRow, toCol);
    return;
  }

  if (!isEmptySquare(targetPiece)) {
    storeCapturedPiece(movingPieceColor, targetPiece);
  }

  relocatePiece(fromRow, fromCol, toRow, toCol);
  promoteIfNeeded(toRow, toCol);
}

function switchPlayer() {
  currentPlayer = currentPlayer === PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE;
}

function promoteIfNeeded(row, col) {
  const piece = board[row][col];
  const color = getPieceColor(piece);

  if (piece === PIECES.WHITE.PAWN && row === PROMOTION_ROW[PLAYERS.WHITE]) {
    board[row][col] = PIECES.WHITE.QUEEN;
    return;
  }

  if (piece === PIECES.BLACK.PAWN && row === PROMOTION_ROW[PLAYERS.BLACK]) {
    board[row][col] = PIECES.BLACK.QUEEN;
  }
}

function storeCapturedPiece(movingPieceColor, capturedPiece) {
  if (movingPieceColor === PLAYERS.WHITE) {
    whiteCaptured.push(capturedPiece);
    return;
  }

  if (movingPieceColor === PLAYERS.BLACK) {
    blackCaptured.push(capturedPiece);
  }
}

function logGameState() {
  console.log(evalScore);

  if (isCheckmate(currentPlayer)) {
    console.log(`Checkmate! ${currentPlayer} loses.`);
    return;
  }

  if (isStalemate(currentPlayer)) {
    console.log("Stalemate!");
  }
}

// SELECTION
function selectSquare(row, col) {
  selectedSquare = { row, col };
  legalMoves = getLegalMoves(row, col);
}

function clearSelection() {
  selectedSquare = null;
  legalMoves = [];
}