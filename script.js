"use strict"

const mainMenu = new MainMenu(chessBoard);

//Initialize chessboard, icons and all Piece objects 
chessBoard.initChessBoard();
chessBoard.addIconsToBoard();
chessBoard.initPieceObjects();

// Handle click events
document.addEventListener("click", function(e) {

    if(mainMenu.modalWindowDisplayed) return;

    if(chessBoard.pieceTypeOptionMenuDisplayed) {
        chessBoard.transformSoldier(e.target);
        return;
    }
    
    if(chessBoard.selectedObject) {
        chessBoard.movePiece(e.target);
        if(chessBoard.isComputersTurn(mainMenu))
            console.log("Computer's turn");
    } else {
        chessBoard.selectedObject = chessBoard.selectPiece(e.target);
    }
});