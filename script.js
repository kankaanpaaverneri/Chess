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

class Piece {
    #type;
    #side;
    #isSelected;
    constructor(type, side) {
        this.#isSelected = false;
        this.#type = type;
        this.#side = side;
    }
    get isSelected() {
        return this.#isSelected;
    }
    set isSelected(isSelected) {
        this.#isSelected = isSelected;
    }
    highlightSquare() {
        
    }
}

const piecesArray = []; //For storing all the piece objects

//Function initializes 32 piece objects
function initPieceObjects() {
    const imgs = document.querySelectorAll("img");
    imgs.forEach(img => {

        //Define piece side
        let side;
        if(img.getAttribute("src").includes("black"))
            side = "black";
        else if(img.getAttribute("src").includes("white"))
            side = "white";

        //Define pieceType
        const pieceTypes = ["tower", "horse", "bishop", "king", "queen", "soldier"];
        const [pieceType] = pieceTypes.filter(pieceType => {
            if(img.getAttribute("src").includes(pieceType))
                return pieceType;
        })

        //Create a new object
        const piece = new Piece(pieceType, side);
        piecesArray.push(piece);
    })
}

initPieceObjects();