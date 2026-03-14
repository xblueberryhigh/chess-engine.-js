# chess-engine-js
# JavaScript Chess Engine

A browser-based vanilla JavaScript chess engine and interactive chessboard implementing full game rules and move validation.  
The project focuses on the logic behind chess mechanics such as legal move generation and check detection.

## Features (Implemented so far)

- Interactive chessboard
- Legal move validation
- Check detection
- Refactored move validation into two layers:
  - `isPseudoLegalMove()` for piece movement rules
  - `isLegalMove()` which simulates the move and ensures the king is not left in check

## Roadmap / Next Steps

- Further improving move validation
- Checkmate detection (and stalemate)
- Integrating special rules such as en passant, pawn promotion and castling
- Move history
- UI improvements
- Refactoring the game logic

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

