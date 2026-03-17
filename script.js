// ====================
// GAME STATE
// ====================
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

let evalScore = 0;

let whiteCaptured = [];
let blackCaptured = [];

let castlingRights = {
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true
};


// ====================
// RENDERING / UI
// ====================
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
  if (!isLegalMove(fromRow, fromCol, row, col)) {
    return;
  }

  playMove(fromRow, fromCol, row, col);
}


// ====================
// TURN FLOW
// ====================
function playMove(fromRow, fromCol, toRow, toCol){
  score(fromRow, fromCol, toRow, toCol);
  updateCastlingRights(fromRow, fromCol, toRow, toCol);
  movePiece(fromRow, fromCol, toRow, toCol);

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

  // Castling
  doCastle(fromRow, fromCol, toRow, toCol);

  // Normal move
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = "";

  //if promotion
  handlePromotion(toRow, toCol);
}
function switchPlayer() {
  currentPlayer = currentPlayer === "white" ? "black" : "white";
}


// ====================
// SELECTION HELPERS
// ====================
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
function isLegalMoveSquare(row, col){
  return legalMoves.some(move => move.row === row && move.col === col);
}
function getLegalMoves(fromRow, fromCol){
  const legalMoves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isLegalMove(fromRow, fromCol, row, col)) {
        legalMoves.push({ row, col });
      }
    }
  }

  return legalMoves;
}

// ====================
// GAME-END LOGIC
// ====================
function hasAnyLegalMoves(color) {
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];

      if (getPieceColor(piece) !== color) continue;

      for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
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


// ====================
// SCORING / CAPTURE
// ====================
function score(fromRow, fromCol, toRow, toCol) {
  if (!isCapture(fromRow, fromCol, toRow, toCol)) return;

  const movingPieceColor = getPieceColor(board[fromRow][fromCol]);
  const capturedPiece = board[toRow][toCol]; // ← actual piece
  const capturedPieceValue = getPieceValue(toRow, toCol);

  // Store captured piece
  if (movingPieceColor === "white") {
    whiteCaptured.push(capturedPiece);
  } else {
    blackCaptured.push(capturedPiece);
  }

  // eval system
  if (movingPieceColor === "white") {
    evalScore += capturedPieceValue;
  } else {
    evalScore -= capturedPieceValue;
  }

  console.log(`Eval: ${evalScore}`);
  console.log("White captured:", whiteCaptured);
  console.log("Black captured:", blackCaptured);
}
function getPieceValue(toRow, toCol){
  capturedPiece = board[toRow][toCol];
  
  switch (capturedPiece) {
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

// ====================
// CHECK / ATTACK LOGIC
// ====================
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

  return isSquareAttacked(kingPos.row, kingPos.col, opponent);
}
function isSquareAttacked(targetRow, targetCol, byColor){
  for(let row=0; row<8; row++){
    for(let col=0; col<8; col++){
      const piece = board[row][col];

      if(getPieceColor(piece) !== byColor) continue;

      if (doesPieceAttackSquare(row, col, targetRow, targetCol)){
        return true;
      }
    }
  }
  return false;
}
function doesPieceAttackSquare(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  if (piece === "") return false;
  if (fromRow === toRow && fromCol === toCol) return false;

  switch (piece) {
    case "♙":
      return toRow === fromRow - 1 && Math.abs(toCol - fromCol) === 1;

    case "♟":
      return toRow === fromRow + 1 && Math.abs(toCol - fromCol) === 1;

    case "♖":
    case "♜":
      return isStraightMove(fromRow, fromCol, toRow, toCol) &&
             isPathClear(fromRow, fromCol, toRow, toCol);

    case "♗":
    case "♝":
      return isDiagonalMove(fromRow, fromCol, toRow, toCol) &&
             isPathClear(fromRow, fromCol, toRow, toCol);

    case "♕":
    case "♛":
      return (
        (isStraightMove(fromRow, fromCol, toRow, toCol) ||
         isDiagonalMove(fromRow, fromCol, toRow, toCol)) &&
        isPathClear(fromRow, fromCol, toRow, toCol)
      );

    case "♘":
    case "♞":
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);

    case "♔":
    case "♚":
      return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;

    default:
      return false;
  }
}

// ====================
// CASTLING LOGIC
// ====================
function updateCastlingRights(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const capturedPiece = board[toRow][toCol];

  // King moved
  if (piece === "♔") {
    castlingRights.whiteKingSide = false;
    castlingRights.whiteQueenSide = false;
  }

  if (piece === "♚") {
    castlingRights.blackKingSide = false;
    castlingRights.blackQueenSide = false;
  }

  // White rooks moved
  if (piece === "♖" && fromRow === 7 && fromCol === 0) {
    castlingRights.whiteQueenSide = false;
  }

  if (piece === "♖" && fromRow === 7 && fromCol === 7) {
    castlingRights.whiteKingSide = false;
  }

  // Black rooks moved
  if (piece === "♜" && fromRow === 0 && fromCol === 0) {
    castlingRights.blackQueenSide = false;
  }

  if (piece === "♜" && fromRow === 0 && fromCol === 7) {
    castlingRights.blackKingSide = false;
  }

  // If a rook gets captured on its original square
  if (capturedPiece === "♖" && toRow === 7 && toCol === 0) {
    castlingRights.whiteQueenSide = false;
  }

  if (capturedPiece === "♖" && toRow === 7 && toCol === 7) {
    castlingRights.whiteKingSide = false;
  }

  if (capturedPiece === "♜" && toRow === 0 && toCol === 0) {
    castlingRights.blackQueenSide = false;
  }

  if (capturedPiece === "♜" && toRow === 0 && toCol === 7) {
    castlingRights.blackKingSide = false;
  }
}
function isCastlingMove(fromRow, fromCol, toRow, toCol){
  const piece = board[fromRow][fromCol];

  if (piece !== "♔" && piece !== "♚") return false;

  return fromRow === toRow && Math.abs(toCol - fromCol) ===2;
}
function isValidCastlingMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  // White king
  if (piece === "♔" && fromRow === 7 && fromCol === 4) {
    // King side: e1 -> g1
    if (toRow === 7 && toCol === 6) {
      if (!castlingRights.whiteKingSide) return false;
      if (board[7][5] !== "" || board[7][6] !== "") return false;
      if (board[7][7] !== "♖") return false;
      if (isKingInCheck("white")) return false;
      if (isSquareAttacked(7, 5, "black")) return false;
      if (isSquareAttacked(7, 6, "black")) return false;
      return true;
    }

    // Queen side: e1 -> c1
    if (toRow === 7 && toCol === 2) {
      if (!castlingRights.whiteQueenSide) return false;
      if (board[7][1] !== "" || board[7][2] !== "" || board[7][3] !== "") return false;
      if (board[7][0] !== "♖") return false;
      if (isKingInCheck("white")) return false;
      if (isSquareAttacked(7, 3, "black")) return false;
      if (isSquareAttacked(7, 2, "black")) return false;
      return true;
    }
  }

  // Black king
  if (piece === "♚" && fromRow === 0 && fromCol === 4) {
    // King side: e8 -> g8
    if (toRow === 0 && toCol === 6) {
      if (!castlingRights.blackKingSide) return false;
      if (board[0][5] !== "" || board[0][6] !== "") return false;
      if (board[0][7] !== "♜") return false;
      if (isKingInCheck("black")) return false;
      if (isSquareAttacked(0, 5, "white")) return false;
      if (isSquareAttacked(0, 6, "white")) return false;
      return true;
    }

    // Queen side: e8 -> c8
    if (toRow === 0 && toCol === 2) {
      if (!castlingRights.blackQueenSide) return false;
      if (board[0][1] !== "" || board[0][2] !== "" || board[0][3] !== "") return false;
      if (board[0][0] !== "♜") return false;
      if (isKingInCheck("black")) return false;
      if (isSquareAttacked(0, 3, "white")) return false;
      if (isSquareAttacked(0, 2, "white")) return false;
      return true;
    }
  }

  return false;
}
function doCastle(fromRow, fromCol, toRow, toCol){

  const piece = board[fromRow][fromCol];
  if (isCastlingMove(fromRow, fromCol, toRow, toCol)) {
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = "";

    // King side
    if (toCol === 6) {
      board[toRow][5] = board[toRow][7];
      board[toRow][7] = "";
    }

    // Queen side
    if (toCol === 2) {
      board[toRow][3] = board[toRow][0];
      board[toRow][0] = "";
    }

    return;
  }
}


// ====================
// MOVE VALIDATION
// ====================
function isPseudoLegalMove(fromRow, fromCol, toRow, toCol) {
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
function isLegalMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const movingColor = getPieceColor(piece);

  if (!isPseudoLegalMove(fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  // Save board state
  const capturedPiece = board[toRow][toCol];

  // Special simulation for castling
  if (isCastlingMove(fromRow, fromCol, toRow, toCol)) {
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = "";

    if (toCol === 6) {
      board[toRow][5] = board[toRow][7];
      board[toRow][7] = "";
    } else if (toCol === 2) {
      board[toRow][3] = board[toRow][0];
      board[toRow][0] = "";
    }

    const kingInCheck = isKingInCheck(movingColor);

    // Undo castling simulation
    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = capturedPiece;

    if (toCol === 6) {
      board[toRow][7] = board[toRow][5];
      board[toRow][5] = "";
    } else if (toCol === 2) {
      board[toRow][0] = board[toRow][3];
      board[toRow][3] = "";
    }

    return !kingInCheck;
  }

  // Normal move simulation
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = "";

  const kingInCheck = isKingInCheck(movingColor);

  board[fromRow][fromCol] = piece;
  board[toRow][toCol] = capturedPiece;

  return !kingInCheck;
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

// ====================
// PIECE MOVEMENT RULES
// ====================
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

  if (rowDiff <= 1 && colDiff <= 1) {
    return true;
  }

  if (isValidCastlingMove(fromRow, fromCol, toRow, toCol)) {
    return true;
  }

  return false;
}

// ====================
// GENERIC BOARD HELPERS
// ====================
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

// ====================
// START GAME
// ====================
renderBoard();