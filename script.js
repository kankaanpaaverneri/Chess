"use strict"

const chessBoard = {
    selectedObject: undefined,
    colors: [],
    squareIds: [],
    piecesArray: [], //For storing all the piece objects

    //Generate html for the chessboard squares
    initChessBoard: function() {
        const chessBoardContainer = document.querySelector(".chessboard-container");
        for(let column = 0; column < 8; column++) {
            const isColumnOdd = column % 2 == 1;
            for(let row = 0; row < 8; row++) {
                const squareColor = row % 2 == isColumnOdd ? "grey" : "white";
                const html = `<div id="${column} ${row}" class="square" style="background-color: ${squareColor};"></div>`;
                chessBoardContainer.insertAdjacentHTML("beforeend", html);
                chessBoard.colors.push(squareColor);
                chessBoard.squareIds.push(`${column} ${row}`);
            }
        }
    },
    //Generate html for adding icons to the chessboard
    addIconsToBoard: function () {

        const pieces = ["tower", "horse", "bishop", "king", "queen", "bishop", "horse", "tower"];
    
        for(let row = 0; row < 8; row++) {
            document.getElementById(`1 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/soldier_black.svg">`);
            document.getElementById(`6 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/soldier_white.svg">`);
            document.getElementById(`0 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/${pieces[row]}_black.svg">`);
            document.getElementById(`7 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/${pieces[row]}_white.svg">`);
        }
    },

    resetSquareColors: function() {
        const squares = document.querySelectorAll(".square");
        squares.forEach((square, i) => square.style.background = this.colors[i]);
    },

    selectPiece: function (target) {
        this.resetSquareColors();
        this.selectedObject = undefined;
        if(target.closest("img"))
        {
            //Find right pieceObject by comparing ids
            chessBoard.selectedObject = this.piecesArray.find(piece => {
              if(target.closest(".square").getAttribute("id") === piece.locationId)
                    return piece;
            });


            //Switch isSelected value
            chessBoard.selectedObject.isSelected = chessBoard.selectedObject.isSelected === false ? true : false;

            //Highlight selected square
            chessBoard.selectedObject.icon.closest(".square").style.background = "#fcba03";
        }
    },

    //Function initializes 32 piece objects
    initPieceObjects: function () {
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

            //Define initial locationId
            const locationId = img.closest(".square").getAttribute("id");


            //Create a new object
            const piece = new Piece(locationId, pieceType, side, img);
            this.piecesArray.push(piece);
        })
    }
};

class Piece {
    #locationId;
    #type;
    #side;
    #isSelected;
    #icon;
    constructor(locationId, type, side, icon) {
        this.#locationId = locationId;
        this.#isSelected = false;
        this.#type = type;
        this.#side = side;
        this.#icon = icon;
    }

    get type() {
        return this.#type;
    }

    set type(type) {
        this.#type = type;
    }

    get side() {
        return this.#side;
    } 

    set side(side) {
        this.#side = side;
    }
    get isSelected() {
        return this.#isSelected;
    }
    get locationId() {
        return this.#locationId;
    }
    set locationId(locationId) {
        this.#locationId = locationId;

    }
    set isSelected(isSelected) {
        this.#isSelected = isSelected;
    }

    set icon(icon) {
        this.#icon = icon;
    }

    get icon() {
        return this.#icon;
    }
    highlightSquare() {
        
    }
}

chessBoard.initChessBoard();
chessBoard.addIconsToBoard();
chessBoard.initPieceObjects();

document.addEventListener("click", function(e) {
    e.preventDefault();
    chessBoard.selectPiece(e.target);
    
});