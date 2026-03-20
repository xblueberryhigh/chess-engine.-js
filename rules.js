//Chess laws

// MOVE VALIDATION
function isPseudoLegalMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const targetPiece = board[toRow][toCol];

  if (isEmptySquare(piece)) return false;
  if (isSameSquare(fromRow, fromCol, toRow, toCol)) return false;
  if (areSameColor(piece, targetPiece)) return false;

  switch (piece) {
    case PIECES.WHITE.PAWN:
    case PIECES.BLACK.PAWN:
      return isValidPawnMove(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.ROOK:
    case PIECES.BLACK.ROOK:
      return isValidRookMove(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.KNIGHT:
    case PIECES.BLACK.KNIGHT:
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.BISHOP:
    case PIECES.BLACK.BISHOP:
      return isValidBishopMove(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.QUEEN:
    case PIECES.BLACK.QUEEN:
      return isValidQueenMove(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.KING:
    case PIECES.BLACK.KING:
      return isValidKingMove(fromRow, fromCol, toRow, toCol);

    default:
      return false;
  }
}
function isLegalMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const movingColor = getPieceColor(piece);

  if (!isPseudoLegalMove(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  const capturedPiece = board[toRow][toCol];

  if (isCastlingMove(fromRow, fromCol, toRow, toCol)) {
    relocatePiece(fromRow, fromCol, toRow, toCol);

    if (toCol === COLS.KING_SIDE_CASTLE) {
      relocatePiece(toRow, COLS.KING_SIDE_ROOK_FROM, toRow, COLS.KING_SIDE_ROOK_TO);
    } else if (toCol === COLS.QUEEN_SIDE_CASTLE) {
      relocatePiece(toRow, COLS.QUEEN_SIDE_ROOK_FROM, toRow, COLS.QUEEN_SIDE_ROOK_TO);
    }

    const kingInCheck = isKingInCheck(movingColor);

    restoreMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
    restoreCastleRook(toRow, toCol);

    return !kingInCheck;
  }

  if (isEnPassantMove(fromRow, fromCol, toRow, toCol)) {
    const epCapturedPiece = board[enPassantTarget.captureRow][enPassantTarget.captureCol];

    relocatePiece(fromRow, fromCol, toRow, toCol);
    board[enPassantTarget.captureRow][enPassantTarget.captureCol] = EMPTY_SQUARE;

    const kingInCheck = isKingInCheck(movingColor);

    restoreMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
    board[enPassantTarget.captureRow][enPassantTarget.captureCol] = epCapturedPiece;

    return !kingInCheck;
  }

  relocatePiece(fromRow, fromCol, toRow, toCol);

  const kingInCheck = isKingInCheck(movingColor);

  restoreMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece);

  return !kingInCheck;
}
function getLegalMoves(fromRow, fromCol) {
  const moves = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isLegalMove(fromRow, fromCol, row, col)) {
        moves.push({ row, col });
      }
    }
  }

  return moves;
}

// CHECK / ATTACK 
function getKingPosition(color) {
  const king = KINGS[color];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === king) {
        return { row, col };
      }
    }
  }

  return null;
}
function isKingInCheck(color) {
  const kingPos = getKingPosition(color);
  if (!kingPos) return false;

  return isSquareAttacked(kingPos.row, kingPos.col, getOpponentColor(color));
}
function isSquareAttacked(targetRow, targetCol, byColor) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];

      if (getPieceColor(piece) !== byColor) continue;

      if (doesPieceAttackSquare(row, col, targetRow, targetCol)) {
        return true;
      }
    }
  }

  return false;
}
function doesPieceAttackSquare(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  if (isEmptySquare(piece)) return false;
  if (isSameSquare(fromRow, fromCol, toRow, toCol)) return false;

  switch (piece) {
    case PIECES.WHITE.PAWN:
    case PIECES.BLACK.PAWN: {
    const color = getPieceColor(piece);
  return toRow === fromRow + PAWN_FORWARD[color] && Math.abs(toCol - fromCol) === 1;
}

    case PIECES.WHITE.ROOK:
    case PIECES.BLACK.ROOK:
      return isStraightMove(fromRow, fromCol, toRow, toCol) &&
        isPathClear(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.BISHOP:
    case PIECES.BLACK.BISHOP:
      return isDiagonalMove(fromRow, fromCol, toRow, toCol) &&
        isPathClear(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.QUEEN:
    case PIECES.BLACK.QUEEN:
      return (
        (isStraightMove(fromRow, fromCol, toRow, toCol) ||
          isDiagonalMove(fromRow, fromCol, toRow, toCol)) &&
        isPathClear(fromRow, fromCol, toRow, toCol)
      );

    case PIECES.WHITE.KNIGHT:
    case PIECES.BLACK.KNIGHT:
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);

    case PIECES.WHITE.KING:
    case PIECES.BLACK.KING:
      return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;

    default:
      return false;
  }
}

//GAME-END 
function hasAnyLegalMoves(color) {
  for (let fromRow = 0; fromRow < BOARD_SIZE; fromRow++) {
    for (let fromCol = 0; fromCol < BOARD_SIZE; fromCol++) {
      const piece = board[fromRow][fromCol];

      if (getPieceColor(piece) !== color) continue;

      for (let toRow = 0; toRow < BOARD_SIZE; toRow++) {
        for (let toCol = 0; toCol < BOARD_SIZE; toCol++) {
          if (isLegalMove(fromRow, fromCol, toRow, toCol)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
function isCheckmate(color) {
  return isKingInCheck(color) && !hasAnyLegalMoves(color);
}
function isStalemate(color) {
  return !isKingInCheck(color) && !hasAnyLegalMoves(color);
}

//CASTLING 
function updateCastlingRights(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const capturedPiece = board[toRow][toCol];

  if (piece === PIECES.WHITE.KING) {
    castlingRights.whiteKingSide = false;
    castlingRights.whiteQueenSide = false;
  }

  if (piece === PIECES.BLACK.KING) {
    castlingRights.blackKingSide = false;
    castlingRights.blackQueenSide = false;
  }

  if (piece === PIECES.WHITE.ROOK || piece === PIECES.BLACK.ROOK) {
    disableCastlingRightForRookSquare(fromRow, fromCol);
  }

  if (capturedPiece === PIECES.WHITE.ROOK || capturedPiece === PIECES.BLACK.ROOK) {
    disableCastlingRightForRookSquare(toRow, toCol);
  }
}
function isCastlingMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  if (piece !== PIECES.WHITE.KING && piece !== PIECES.BLACK.KING) {
    return false;
  }

  return fromRow === toRow && Math.abs(toCol - fromCol) === 2;
}
function isValidCastlingMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const color = getPieceColor(piece);
  const backRank = color === PLAYERS.WHITE ? ROWS.WHITE_BACK_RANK : ROWS.BLACK_BACK_RANK;

  if (
    (piece !== PIECES.WHITE.KING && piece !== PIECES.BLACK.KING) ||
    fromRow !== backRank ||
    fromCol !== COLS.KING_START ||
    toRow !== backRank
  ) {
    return false;
  }

  if (toCol === COLS.KING_SIDE_CASTLE) {
    return canCastleKingSide(color);
  }

  if (toCol === COLS.QUEEN_SIDE_CASTLE) {
    return canCastleQueenSide(color);
  }

  return false;
}
function doCastle(fromRow, fromCol, toRow, toCol) {
  if (!isCastlingMove(fromRow, fromCol, toRow, toCol)) {
    return;
  }

  relocatePiece(fromRow, fromCol, toRow, toCol);

  if (toCol === COLS.KING_SIDE_CASTLE) {
    relocatePiece(toRow, COLS.KING_SIDE_ROOK_FROM, toRow, COLS.KING_SIDE_ROOK_TO);
    return;
  }

  if (toCol === COLS.QUEEN_SIDE_CASTLE) {
    relocatePiece(toRow, COLS.QUEEN_SIDE_ROOK_FROM, toRow, COLS.QUEEN_SIDE_ROOK_TO);
  }
}

//EN PASSANT
function isEnPassantMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  if (piece !== PIECES.WHITE.PAWN && piece !== PIECES.BLACK.PAWN) return false;
  if (!enPassantTarget) return false;

  return (
    enPassantTarget.row === toRow &&
    enPassantTarget.col === toCol &&
    Math.abs(toCol - fromCol) === 1 &&
    isEmptySquare(board[toRow][toCol])
  );
}
function updateEnPassantState(fromRow, fromCol, toRow, toCol) {
  const piece = board[toRow][toCol];
  const color = getPieceColor(piece);

  enPassantTarget = null;

  if (piece !== PIECES.WHITE.PAWN && piece !== PIECES.BLACK.PAWN) {
    return;
  }

  const forwardStep = PAWN_FORWARD[color];
  const startRow = PAWN_START_ROW[color];

  if (
    fromRow === startRow &&
    toRow === fromRow + forwardStep * 2 &&
    fromCol === toCol
  ) {
    enPassantTarget = {
      row: fromRow + forwardStep,
      col: fromCol,
      captureRow: toRow,
      captureCol: fromCol,
      vulnerableColor: color
    };
  }
}