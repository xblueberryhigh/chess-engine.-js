//How pieces move

function isValidPawnMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const color = getPieceColor(piece);

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  const targetPiece = board[toRow][toCol];

  if (color === "white") {

    // forward move
    if (colDiff === 0 && rowDiff === -1 && targetPiece === "") {
      return true;
    }

    // double move from starting row
    if (
      fromRow === 6 &&
      colDiff === 0 &&
      rowDiff === -2 &&
      targetPiece === "" &&
      board[fromRow - 1][fromCol] === ""
    ) {
      return true;
    }

    // capture
    if (
      Math.abs(colDiff) === 1 &&
      rowDiff === -1 &&
      targetPiece !== "" &&
      getPieceColor(targetPiece) === "black"
    ) {
      return true;
    }

     if (
      Math.abs(colDiff) === 1 &&
      rowDiff === -1 &&
      isEnPassantMove(fromRow, fromCol, toRow, toCol)
    ) {
      return true;
    }

  }

  if (color === "black") {

    if (colDiff === 0 && rowDiff === 1 && targetPiece === "") {
      return true;
    }

    if (
      fromRow === 1 &&
      colDiff === 0 &&
      rowDiff === 2 &&
      targetPiece === "" &&
      board[fromRow + 1][fromCol] === ""
    ) {
      return true;
    }

    if (
      Math.abs(colDiff) === 1 &&
      rowDiff === 1 &&
      targetPiece !== "" &&
      getPieceColor(targetPiece) === "white"
    ) {
      return true;
    }

    if (
      Math.abs(colDiff) === 1 &&
      rowDiff === 1 &&
      isEnPassantMove(fromRow, fromCol, toRow, toCol)
    ) {
      return true;
    }

  }

  return false;
}
function isValidRookMove(fromRow, fromCol, toRow, toCol) {
  if (!isStraightMove(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  return isPathClear(fromRow, fromCol, toRow, toCol);
}
function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
  if (!isDiagonalMove(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  return isPathClear(fromRow, fromCol, toRow, toCol);
}
function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
  if (
    isStraightMove(fromRow, fromCol, toRow, toCol) ||
    isDiagonalMove(fromRow, fromCol, toRow, toCol)
  ) {
    return isPathClear(fromRow, fromCol, toRow, toCol);
  }

  return false;
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

  if (rowDiff <= 1 && colDiff <= 1) {
    return true;
  }

  if (isValidCastlingMove(fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  return false;
}