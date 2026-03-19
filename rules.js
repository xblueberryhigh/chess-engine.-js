//Chess laws

// MOVE VALIDATION
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
  // Special simulation for en passant
  if (isEnPassantMove(fromRow, fromCol, toRow, toCol)) {
    const epCapturedPiece = board[enPassantTarget.captureRow][enPassantTarget.captureCol];

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = "";
    board[enPassantTarget.captureRow][enPassantTarget.captureCol] = "";

    const kingInCheck = isKingInCheck(movingColor);

    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = capturedPiece;
    board[enPassantTarget.captureRow][enPassantTarget.captureCol] = epCapturedPiece;

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

// CHECK / ATTACK 
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

//GAME-END 
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

//CASTLING 
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

//EN PASSANT
function isEnPassantMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  if (piece !== "♙" && piece !== "♟") return false;
  if (!enPassantTarget) return false;

  return (
    enPassantTarget.row === toRow &&
    enPassantTarget.col === toCol &&
    Math.abs(toCol - fromCol) === 1 &&
    board[toRow][toCol] === ""
  );
}
function updateEnPassantState(fromRow, fromCol, toRow, toCol){
  const piece = board[toRow][toCol];
  enPassantTarget = null;

  //White pawn double-step
  // White pawn double-step
  if (piece === "♙" && fromRow === 6 && toRow === 4 && fromCol === toCol) {
    enPassantTarget = {
      row: 5,
      col: fromCol,
      captureRow: 4,
      captureCol: fromCol,
      vulnerableColor: "white"
    };
  }

  // Black pawn double-step
  if (piece === "♟" && fromRow === 1 && toRow === 3 && fromCol === toCol) {
    enPassantTarget = {
      row: 2,
      col: fromCol,
      captureRow: 3,
      captureCol: fromCol,
      vulnerableColor: "black"
    };
  }
}