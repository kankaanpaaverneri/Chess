"use strict"

const chessBoard = {
    selectedObject: undefined,
    colors: [],
    squareIds: [],
    piecesArray: [], //For storing all the piece objects
    turn: "white",
    selectionColor: "#e2dc67",
    validMoveColor: "green",
    validEatColor: "red",

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

        //Find right pieceObject
        const pieceObject = this.piecesArray.find(piece => {
            if(piece.icon === target && piece.icon.getAttribute("src").includes(`${this.turn}`)) return piece;
        });

        if(!pieceObject)
            return null;

        //Highlight selected square
        target.closest(".square").style.background = this.selectionColor;
        pieceObject.displayValidMovements();
        return pieceObject;
    },

    movement(square) {
        if(square.style.background === this.validMoveColor) {
            square.append(this.selectedObject.icon);
            this.selectedObject.locationId = square.getAttribute("id");
            this.selectedObject.turnCount++;
            chessBoard.turn = chessBoard.turn === "white" ? "black" : "white";
            document.querySelector(".turn-value").textContent = chessBoard.turn.toUpperCase();
        }
    },

    eating(square) {
        if(square.style.background === this.validEatColor) {
            square.append(this.selectedObject.icon);
            square.removeChild(square.querySelector("img"));
            this.selectedObject.locationId = square.getAttribute("id");
            this.selectedObject.turnCount++;
            chessBoard.turn = chessBoard.turn === "white" ? "black" : "white";
            document.querySelector(".turn-value").textContent = chessBoard.turn.toUpperCase();
        }
    },

    movePiece(target) {
        const square = target.closest(".square");
        //Moving
        this.movement(square);
        //Eating
        this.eating(square);

        this.selectedObject = undefined;
        this.resetSquareColors();
    },



    createNewObject(locationId, pieceType, side, img) {
        let piece;
        switch(pieceType) {
            case "soldier":
                piece = new Soldier(locationId, pieceType, side, img);
                break;
            case "tower":
                piece = new Tower(locationId, pieceType, side, img);
                break;
            case "horse":
                piece = new Horse(locationId, pieceType, side, img);
                break;
            case "bishop":
                piece = new Bishop(locationId, pieceType, side, img);
                break;
            case "king":
                piece = new King(locationId, pieceType, side, img);
                break;
            case "queen":
                piece = new Queen(locationId, pieceType, side, img);
                break; 
        }
        return piece;
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
            let piece = this.createNewObject(locationId, pieceType, side, img);
            this.piecesArray.push(piece);
        })
    },

    isSquareEmpty: (square) => (!square.querySelector("img")) ? true : false,
};

class Piece {
    #locationId;
    #type;
    #side;
    #isSelected;
    #icon;
    #turnCount;
    constructor(locationId, type, side, icon) {
        this.#locationId = locationId;
        this.#isSelected = false;
        this.#type = type;
        this.#side = side;
        this.#icon = icon;
        this.#turnCount = 0;
    }

    isOwnUnit(square) {
        return square?.querySelector("img").getAttribute("src").includes(`${this.side}`) ? true : false;
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

    get turnCount() {
        return this.#turnCount;
    }

    set turnCount(turnCount) {
        this.#turnCount = turnCount;
    }

    get icon() {
        return this.#icon;
    }
}

class Soldier extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        let [i, j] = this.locationId.split(" ");
        i = parseInt(i);
        j = parseInt(j);

        const firstSquare = document.getElementById(`${this.side === "white" ? i-1 : i+1} ${j}`);
        const secondSquare = document.getElementById(`${this.side === "white" ? i-2 : i+2} ${j}`);

        if(this.turnCount === 0 && chessBoard.isSquareEmpty(secondSquare))
            secondSquare.style.background = chessBoard.validMoveColor;

        if (chessBoard.isSquareEmpty(firstSquare))
            firstSquare.style.background = chessBoard.validMoveColor;

        
        const rightCorner = this.side === "white" ?
            document.getElementById(`${i-1} ${j+1}`) : document.getElementById(`${i+1} ${j-1}`);
        const leftCorner = this.side === "white" ? 
            document.getElementById(`${i-1} ${j-1}`) : document.getElementById(`${i+1} ${j+1}`);

        //Does square have icon and is it own side
        if(leftCorner?.querySelector("img") &&  !this.isOwnUnit(leftCorner))
            leftCorner.style.background = chessBoard.validEatColor;

        if(rightCorner?.querySelector("img") && !this.isOwnUnit(rightCorner))
            rightCorner.style.background = chessBoard.validEatColor;
    }
}

class Tower extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        let [column, row] = this.locationId.split(" ");
        column = parseInt(column);
        row = parseInt(row);
        
        //Scan up
        this.scanDirection(column, row, -1, 0);
        
        //Scan down
        this.scanDirection(column, row, 1, 0);

        //Scan left
        this.scanDirection(column, row, 0, -1);

        //Scan right
        this.scanDirection(column, row, 0, 1);
    }

    scanDirection(column, row, columnStep, rowStep) {
        let i = column + columnStep;
        let j = row + rowStep;

        while(i >= 0 && i < 8 && j >= 0 && j < 8) {
            const square = document.getElementById(`${i} ${j}`);
            const str = this.scanSquare(square);

            if(str === "this-unit")
                continue;
            if(str === "own-unit" || str === "enemy")
                break;

            i += columnStep;
            j += rowStep;
        }
    }

    scanSquare(square) {
        if(this.locationId === square.getAttribute("id"))
            return "this-unit";

        if(square.querySelector("img") && this.isOwnUnit(square))
            return "own-unit";

        if(square.querySelector("img") && !this.isOwnUnit(square)) {
            square.style.background = chessBoard.validEatColor;
            return "enemy";
        }
            

        square.style.background = chessBoard.validMoveColor;

    }
}

class Horse extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }
    displayValidMovements() {
        console.log(this.locationId);
    }
}

class Bishop extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        console.log(this.locationId);
    }
}

class King extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        console.log(this.locationId);
    }
}

class Queen extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        console.log(this.locationId);
    }
}

chessBoard.initChessBoard();
chessBoard.addIconsToBoard();
chessBoard.initPieceObjects();

document.addEventListener("click", function(e) {
    e.preventDefault();
    if(chessBoard.selectedObject)
        chessBoard.movePiece(e.target);
    else
        chessBoard.selectedObject = chessBoard.selectPiece(e.target);
    
});