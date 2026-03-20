// How pieces move

function isValidPawnMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const color = getPieceColor(piece);
  const targetPiece = board[toRow][toCol];

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  const forwardStep = PAWN_FORWARD[color];
  const startRow = PAWN_START_ROW[color];

  if (
    colDiff === 0 &&
    rowDiff === forwardStep &&
    isEmptySquare(targetPiece)
  ) {
    return true;
  }

  if (
    fromRow === startRow &&
    colDiff === 0 &&
    rowDiff === forwardStep * 2 &&
    isEmptySquare(targetPiece) &&
    isEmptySquare(board[fromRow + forwardStep][fromCol])
  ) {
    return true;
  }

  if (
    Math.abs(colDiff) === 1 &&
    rowDiff === forwardStep &&
    areEnemyPieces(piece, targetPiece)
  ) {
    return true;
  }

  if (
    Math.abs(colDiff) === 1 &&
    rowDiff === forwardStep &&
    isEnPassantMove(fromRow, fromCol, toRow, toCol)
  ) {
    return true;
  }

  return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
  return isStraightMove(fromRow, fromCol, toRow, toCol) &&
    isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
  return isDiagonalMove(fromRow, fromCol, toRow, toCol) &&
    isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
  const isValidShape =
    isStraightMove(fromRow, fromCol, toRow, toCol) ||
    isDiagonalMove(fromRow, fromCol, toRow, toCol);

  return isValidShape && isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  return (
    (rowDiff === 2 && colDiff === 1) ||
    (rowDiff === 1 && colDiff === 2)
  );
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  return (
    (rowDiff <= 1 && colDiff <= 1) ||
    isValidCastlingMove(fromRow, fromCol, toRow, toCol)
  );
}