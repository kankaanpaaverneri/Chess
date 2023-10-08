"use strict"

//Generate html for the chessboard squares
function initChessBoard() {
    const chessBoardContainer = document.querySelector(".chessboard-container");
    for(let column = 0; column < 8; column++) {
        const isColumnOdd = column % 2 == 1;
        for(let row = 0; row < 8; row++) {
            const squareColor = row % 2 == isColumnOdd ? "grey" : "white";
            const html = `<div id="${column} ${row}" class="square" style="background-color: ${squareColor};"></div>`;
            chessBoardContainer.insertAdjacentHTML("beforeend", html);
        }
    }
}

function addPiecesToBoard() {

    const pieces = ["tower", "horse", "bishop", "king", "queen", "bishop", "horse", "tower"];

    for(let row = 0; row < 8; row++) {
        document.getElementById(`1 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/soldier_black.svg">`);
        document.getElementById(`6 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/soldier_white.svg">`);
        document.getElementById(`0 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/${pieces[row]}_black.svg">`);
        document.getElementById(`7 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/${pieces[row]}_white.svg">`);
    }
}

initChessBoard();
addPiecesToBoard();
