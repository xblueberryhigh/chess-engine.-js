// Apply moves

// MOVE
function playMove(fromRow, fromCol, toRow, toCol) {
  saveGameState();
  clearRedoHistory();
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


// Undo/Redo
function createGameStateSnapshot() {
  return {
    board: board.map(row => [...row]),
    castlingRights: { ...castlingRights },
    enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
    whiteCaptured: [...whiteCaptured],
    blackCaptured: [...blackCaptured],
    currentPlayer,
    evalScore
  };
}

function saveGameState(){
  moveHistory.push(createGameStateSnapshot());
}

function restoreGameState(previousState) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = previousState.board[row][col];
    }
  }

  castlingRights.whiteKingSide = previousState.castlingRights.whiteKingSide;
  castlingRights.whiteQueenSide = previousState.castlingRights.whiteQueenSide;
  castlingRights.blackKingSide = previousState.castlingRights.blackKingSide;
  castlingRights.blackQueenSide = previousState.castlingRights.blackQueenSide;

  enPassantTarget = previousState.enPassantTarget;
  currentPlayer = previousState.currentPlayer;
  evalScore = previousState.evalScore;

  whiteCaptured.length = 0;
  whiteCaptured.push(...previousState.whiteCaptured);

  blackCaptured.length = 0;
  blackCaptured.push(...previousState.blackCaptured);
}

function undoMove() {
  const previousState = moveHistory.pop();

  if (!previousState) {
    return;
  }

  redoHistory.push(createGameStateSnapshot());

  restoreGameState(previousState);
  clearSelection();
  renderBoard();
}

function redoMove() {
  const nextState = redoHistory.pop();

  if (!nextState) {
    return;
  }

  moveHistory.push(createGameStateSnapshot());

  restoreGameState(nextState);
  clearSelection();
  renderBoard();
}
function clearRedoHistory(){
  redoHistory.length = 0;
}