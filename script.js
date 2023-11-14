"use strict"

//Initialize chessboard, icons and all Piece objects 
chessBoard.initChessBoard();
chessBoard.addIconsToBoard();
chessBoard.initPieceObjects();

// Handle click events
document.addEventListener("click", function(e) {
    e.preventDefault();

    if(chessBoard.pieceTypeOptionMenuDisplayed) {
        chessBoard.transformSoldier(e.target);
    } else {
        if(chessBoard.selectedObject)
            chessBoard.movePiece(e.target);
        else
            chessBoard.selectedObject = chessBoard.selectPiece(e.target);
    }
});