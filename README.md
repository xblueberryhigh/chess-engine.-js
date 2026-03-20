# chess-engine-js
# JavaScript Chess Engine

A browser-based vanilla JavaScript chess engine and interactive chessboard implementing full game rules and move validation.  
The project focuses on the logic behind chess mechanics such as legal move generation and check detection.

## Features (Implemented so far)

- Interactive chessboard
- Legal move validation
- Check detection
- Checkmate detection (and stalemate)
- Improved move validation (separate attack detection from move validation) with isSquareAttacked(row, col, byColor)
- Castling got integrated
- Cleaner structure and functions seperation
- Accurate piece value and evalScore integrated, which captured pieces tracking (For UI later).
- Pawn promotion got integrated
- Enhanced material balance and score integrating 'computeMaterial()' rather than incrementally computing the material balance
- En passant got integrated (FULL CHESS RULES INTEGRATED !)
- Big refactor into different files
- Undo/Redo 


## Roadmap / Next Steps

- Better kings being adjacent checking
- isLegalMove mutates the real board - can become unstable later. Better clone the board.
- UI improvements

## Tech

- Vanilla JavaScript
- HTML
- CSS

## Running the project

Clone the repository:

https://github.com/xblueberryhigh/chess-engine.-js.git

Open `index.html` in your browser.

## Architecture Notes

### Move validation refactor

Originally a single function handled both move validation and check detection, which created circular logic when preventing self-check moves.

The logic was refactored into two layers:

- `isPseudoLegalMove()` handles piece movement rules.
- `isLegalMove()` simulates the move and ensures the player's king is not left in check.

This separation simplifies rule validation and avoids recursive dependencies when detecting checks.

### Checkmate/Stalemate detection

- Added full game-state evaluation using `hasAnyLegalMoves()`, enabling checkmate and stalemate detection.

### Dedicated attack detection (`isSquareAttacked`)

Originally, check detection relied on the same logic used for move validation.  
To determine if a king was in check, the engine attempted to reuse piece move validation functions to see if an opponent piece could move to the king’s square.

This approach created architectural problems:

- Move validation (`isLegalMove`) already depends on check detection.
- Check detection attempted to reuse move validation logic.
- This created **tight coupling and risk of circular dependencies**.

To solve this, attack detection was separated from move validation.

A new function was introduced:

- `isSquareAttacked(row, col, byColor)`

This function iterates over all pieces of the attacking side and determines whether any of them attack the target square.

Attack logic is evaluated through a dedicated helper:

- `doesPieceAttackSquare()`

This function evaluates **attack patterns only**, without applying full move legality rules such as:

- self-check prevention
- turn logic
- special move constraints

This separation allows the engine to:

- evaluate checks safely
- simplify move validation
- avoid recursive dependencies between rule systems

The result is a clearer architecture where:

- `isPseudoLegalMove()` handles **movement rules**
- `isSquareAttacked()` handles **threat detection**
- `isLegalMove()` combines both to enforce full chess rules


