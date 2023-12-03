"use strict"

const mainMenu = new MainMenu(chessBoard);

// Handle click events
document.addEventListener("click", function(e) {

    if(mainMenu.modalWindowDisplayed)
        return;

    //If need to transform soldier
    if(chessBoard.pieceTypeOptionMenuDisplayed) {
        chessBoard.transformSoldier(e.target, mainMenu);
        return;
    }
    
    //Handle icon selection
    if(!chessBoard.selectedObject) {
        chessBoard.selectedObject = chessBoard.selectPiece(e.target);
        return;
    }

    //Handle icon movement
    chessBoard.movePieceToClickedSquare(e.target);
    if(chessBoard.isComputersTurn(mainMenu))
        console.log("Computer's turn");
});