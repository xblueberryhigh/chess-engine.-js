//Tools

function isStraightMove(fromRow, fromCol, toRow, toCol) {
  return fromRow === toRow || fromCol === toCol;
}
function isDiagonalMove(fromRow, fromCol, toRow, toCol) {
  return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
}
function isPathClear(fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol] !== "") {
      return false;
    }

    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
}
function getPieceColor(piece) {
  if (piece === "") return null;

  const whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔"];
  const blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚"];

  if (whitePieces.includes(piece)) return "white";
  if (blackPieces.includes(piece)) return "black";

  return null;
}
function getPieceValue(piece){
  
  switch (piece) {
    case "♙":
    case "♟":
      return 1;
    case "♖":
    case "♜":
      return 5;
    case "♘":
    case "♞":
    case "♗":
    case "♝":
      return 3;
    case "♕":
    case "♛":
      return 9;
    default:
      return 0;
  }

}
function computeMaterial() {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === "") continue; 

      const value = getPieceValue(piece);
      const color = getPieceColor(piece);

      if (color === "white") { 
        score += value;
      } else {
        score -= value;
      }
    }
  }

  return score;
}