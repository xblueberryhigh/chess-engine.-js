let board = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"],
];

const chessboard = document.getElementById("chessboard");

let selectedSquare = null;
let legalMoves = [];
let currentPlayer = "white";

let whiteScore= 0;
let blackScore=0;

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
  if (!isValidMove(fromRow, fromCol, row, col)) {
    return;
  }

  score(fromRow, fromCol, row, col);
  movePiece(fromRow, fromCol, row, col);
  clearSelection();
  switchPlayer();
  isKingInCheck(currentPlayer);
  renderBoard();
}


function score(fromRow, fromCol, toRow, toCol){

  if (!isCapture(fromRow, fromCol, toRow, toCol)) return;

  const movingPieceColor = getPieceColor(board[fromRow][fromCol]);

  if (movingPieceColor === "white"){
    whiteScore++;
  } else {
    blackScore++;
  }

  console.log(`White: ${whiteScore} | Black: ${blackScore}`);
}


function isCapture(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const movingPieceColor = getPieceColor(piece);
  const targetPiece = board[toRow][toCol];
  const targetColor = getPieceColor(targetPiece);

  if (targetPiece === "") {
    return false;
  }

  if (movingPieceColor === targetColor) {
    return false;
  }

  return true;
}

function getLegalMoves(fromRow, fromCol){
  const legalMoves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(fromRow, fromCol, row, col)) {
        legalMoves.push({ row, col });
      }
    }
  }

  return legalMoves;
}

function isLegalMoveSquare(row, col){
  return legalMoves.some(move => move.row === row && move.col === col);
}

function findKing(color) {
  const king = color === "white" ? "♔" : "♚";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === king) {
        return { row, col };
      }
    }
  }
}

function isKingInCheck(color) {
  const kingPos = findKing(color);
  const opponent = color === "white" ? "black" : "white";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];

      if (getPieceColor(piece) === opponent) {
        if (isValidMove(row, col, kingPos.row, kingPos.col)) {
          console.log("Check!");
          return true;
        }
      }
    }
  }

  return false;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const movingPieceColor = getPieceColor(piece);
  const targetPiece = board[toRow][toCol];
  const targetColor = getPieceColor(targetPiece);


  if (piece === "") return false;

  if (fromRow === toRow && fromCol === toCol) return false;

  if (movingPieceColor === targetColor) return false;


  switch (piece) {
    case "♙":
    case "♟":
      return isValidPawnMove(fromRow, fromCol, toRow, toCol); // later: isValidBlackPawnMove(fromRow, fromCol, toRow, toCol)
    case "♖":
    case "♜":
      return isValidRookMove(fromRow, fromCol, toRow, toCol);
    case "♘":
    case "♞":
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);
    case "♗":
    case "♝":
      return isValidBishopMove(fromRow, fromCol, toRow, toCol);
    case "♕":
    case "♛":
      return isValidQueenMove(fromRow, fromCol, toRow, toCol);
    case "♔":
    case "♚":
      return isValidKingMove(fromRow, fromCol, toRow, toCol);
    default:
      return false;
  }
}

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

  return rowDiff <= 1 && colDiff <= 1;
}

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

function movePiece(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = "";
}

function selectSquare(row, col) {
  selectedSquare = { row, col };
  legalMoves = getLegalMoves(row, col);
}

function clearSelection() {
  selectedSquare = null;
  legalMoves = [];
}

function isSelectedSquare(row, col) {
  return (
    selectedSquare !== null &&
    selectedSquare.row === row &&
    selectedSquare.col === col
  );
}

function switchPlayer() {
  currentPlayer = currentPlayer === "white" ? "black" : "white";
}

function getPieceColor(piece) {
  if (piece === "") return null;

  const whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔"];
  const blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚"];

  if (whitePieces.includes(piece)) return "white";
  if (blackPieces.includes(piece)) return "black";

  return null;
}




renderBoard();