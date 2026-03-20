//Tools

function isStraightMove(fromRow, fromCol, toRow, toCol) {
  if (isSameSquare(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  return fromRow === toRow || fromCol === toCol;
}
function isDiagonalMove(fromRow, fromCol, toRow, toCol) {
  if (isSameSquare(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
}
function isPathClear(fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  while (currentRow !== toRow || currentCol !== toCol) {
    if (!isEmptySquare(board[currentRow][currentCol])) {
      return false;
    }

    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
}
function isWhitePiece(piece) {
  return WHITE_PIECES.includes(piece);
}
function isBlackPiece(piece) {
  return BLACK_PIECES.includes(piece);
}
function getPieceColor(piece) {
  if (isWhitePiece(piece)) return PLAYERS.WHITE;
  if (isBlackPiece(piece)) return PLAYERS.BLACK;
  return null;
}
function getPieceValue(piece) {
  return PIECE_VALUES[piece] || 0;
}
function computeMaterial() {
  let score = 0;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];

      if (isEmptySquare(piece)) continue;

      const value = getPieceValue(piece);
      score += isWhitePiece(piece) ? value : -value;
    }
  }

  return score;
}
function relocatePiece(fromRow, fromCol, toRow, toCol) {
  board[toRow][toCol] = board[fromRow][fromCol];
  board[fromRow][fromCol] = EMPTY_SQUARE;
}
function isEmptySquare(piece) {
  return piece === EMPTY_SQUARE;
}

function isSameSquare(fromRow, fromCol, toRow, toCol) {
  return fromRow === toRow && fromCol === toCol;
}

function areSameColor(pieceA, pieceB) {
  const colorA = getPieceColor(pieceA);
  const colorB = getPieceColor(pieceB);

  return colorA !== null && colorA === colorB;
}

function areEnemyPieces(pieceA, pieceB) {
  const colorA = getPieceColor(pieceA);
  const colorB = getPieceColor(pieceB);

  return colorA !== null && colorB !== null && colorA !== colorB;
}

function restoreMove(fromRow, fromCol, toRow, toCol, movedPiece, capturedPiece) {
  board[fromRow][fromCol] = movedPiece;
  board[toRow][toCol] = capturedPiece;
}
function restoreCastleRook(toRow, toCol) {
  if (toCol === COLS.KING_SIDE_CASTLE) {
    relocatePiece(toRow, COLS.KING_SIDE_ROOK_TO, toRow, COLS.KING_SIDE_ROOK_FROM);
    return;
  }

  if (toCol === COLS.QUEEN_SIDE_CASTLE) {
    relocatePiece(toRow, COLS.QUEEN_SIDE_ROOK_TO, toRow, COLS.QUEEN_SIDE_ROOK_FROM);
  }
}

function getOpponentColor(color) {
  return color === PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE;
}

function disableCastlingRightForRookSquare(row, col) {
  if (row === ROWS.WHITE_BACK_RANK && col === COLS.QUEEN_SIDE_ROOK_FROM) {
    castlingRights.whiteQueenSide = false;
  }

  if (row === ROWS.WHITE_BACK_RANK && col === COLS.KING_SIDE_ROOK_FROM) {
    castlingRights.whiteKingSide = false;
  }

  if (row === ROWS.BLACK_BACK_RANK && col === COLS.QUEEN_SIDE_ROOK_FROM) {
    castlingRights.blackQueenSide = false;
  }

  if (row === ROWS.BLACK_BACK_RANK && col === COLS.KING_SIDE_ROOK_FROM) {
    castlingRights.blackKingSide = false;
  }
}

function canCastleKingSide(color) {
  const backRank = color === PLAYERS.WHITE ? ROWS.WHITE_BACK_RANK : ROWS.BLACK_BACK_RANK;
  const rook = color === PLAYERS.WHITE ? PIECES.WHITE.ROOK : PIECES.BLACK.ROOK;
  const opponentColor = getOpponentColor(color);
  const rightsKey = color === PLAYERS.WHITE ? "whiteKingSide" : "blackKingSide";

  if (!castlingRights[rightsKey]) return false;
  if (!isEmptySquare(board[backRank][COLS.KING_SIDE_ROOK_TO])) return false;
  if (!isEmptySquare(board[backRank][COLS.KING_SIDE_CASTLE])) return false;
  if (board[backRank][COLS.KING_SIDE_ROOK_FROM] !== rook) return false;
  if (isKingInCheck(color)) return false;
  if (isSquareAttacked(backRank, COLS.KING_SIDE_ROOK_TO, opponentColor)) return false;
  if (isSquareAttacked(backRank, COLS.KING_SIDE_CASTLE, opponentColor)) return false;

  return true;
}

function canCastleQueenSide(color) {
  const backRank = color === PLAYERS.WHITE ? ROWS.WHITE_BACK_RANK : ROWS.BLACK_BACK_RANK;
  const rook = color === PLAYERS.WHITE ? PIECES.WHITE.ROOK : PIECES.BLACK.ROOK;
  const opponentColor = getOpponentColor(color);
  const rightsKey = color === PLAYERS.WHITE ? "whiteQueenSide" : "blackQueenSide";

  if (!castlingRights[rightsKey]) return false;
  if (!isEmptySquare(board[backRank][COLS.QUEEN_SIDE_BETWEEN_1])) return false;
  if (!isEmptySquare(board[backRank][COLS.QUEEN_SIDE_CASTLE])) return false;
  if (!isEmptySquare(board[backRank][COLS.QUEEN_SIDE_ROOK_TO])) return false;
  if (board[backRank][COLS.QUEEN_SIDE_ROOK_FROM] !== rook) return false;
  if (isKingInCheck(color)) return false;
  if (isSquareAttacked(backRank, COLS.QUEEN_SIDE_ROOK_TO, opponentColor)) return false;
  if (isSquareAttacked(backRank, COLS.QUEEN_SIDE_CASTLE, opponentColor)) return false;

  return true;
}