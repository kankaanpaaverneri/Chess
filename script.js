"use strict"

const chessBoard = {
    selectedObject: undefined,
    squareColors: [],
    squareIds: [],
    piecesArray: [], //For storing all the piece objects
    turn: "white",
    selectionColor: "#e2dc67",
    validMoveColor: "green",
    validEatColor: "red",
    check: false,
    checkMate: false,

    //Generate html for the chessboard squares
    initChessBoard: function() {
        const chessBoardContainer = document.querySelector(".chessboard-container");
        for(let column = 0; column < 8; column++) {
            const isColumnOdd = column % 2 == 1;
            const squareColorsRow = [];
            for(let row = 0; row < 8; row++) {
                const squareColor = row % 2 == isColumnOdd ? "grey" : "white";
                const html = `<div id="${column} ${row}" class="square" style="background-color: ${squareColor};"></div>`;
                chessBoardContainer.insertAdjacentHTML("beforeend", html);
                squareColorsRow.push(squareColor);
                chessBoard.squareIds.push(`${column} ${row}`);
            }
            this.squareColors.push(squareColorsRow);
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
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                const square = document.getElementById(`${i} ${j}`);
                square.style.background = this.squareColors[i][j];
            }
        }
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


        pieceObject.displayValidMovements();

        if(pieceObject.type === "king") {
            pieceObject.removeKingsCheckSquares();
        }

        
        pieceObject.willPieceDefendKing(this);

        //Highlight selected square
        target.closest(".square").style.background = this.selectionColor;
        return pieceObject;
    },

    

    getAllMovementSquares() {
        const movementSquares = [];
        const squares = document.querySelectorAll(".square");
        squares.forEach(square => {
            if(square.style.background === this.validEatColor || square.style.background === this.validMoveColor) {
                movementSquares.push(square);
            }
        });
        return movementSquares;
    },

    removeObjectFromArray(square) {
        //RemoveSHIT FROM ARRAY
        const pieceToRemove = this.piecesArray.find(piece => {
            if(square.querySelector("img") === piece.icon && square.getAttribute("id") === piece.locationId)
                return piece;
        });
        const index = this.piecesArray.indexOf(pieceToRemove);
        this.piecesArray.splice(index, 1);
        return pieceToRemove;
    },

    displayValidCheckDefendMovements(validMovementSquares) {
        validMovementSquares.forEach(square => {
            if(square.querySelector("img"))
                square.style.background = this.validEatColor;
            else
                square.style.background = this.validMoveColor;
        });
    },

    movement(square) {
        if(square.style.background === this.validMoveColor) {
            square.append(this.selectedObject.icon);
            this.selectedObject.locationId = square.getAttribute("id");
            chessBoard.turn = chessBoard.turn === "white" ? "black" : "white";
            this.selectedObject.turnCount++;
            document.querySelector(".turn-value").textContent = this.turn.toUpperCase();
        }
    },

    eating(square) {
        if(square.style.background === this.validEatColor) {
            const removedPiece = this.removeObjectFromArray(square);
            console.log(removedPiece);
            square.append(this.selectedObject.icon);
            square.removeChild(square.querySelector("img"));
            this.selectedObject.locationId = square.getAttribute("id");
            chessBoard.turn = chessBoard.turn === "white" ? "black" : "white";
            this.selectedObject.turnCount++;
            document.querySelector(".turn-value").textContent = this.turn.toUpperCase();
            this.resetSquareColors();
        }
    },

    movePiece(target) {
        const square = target.closest(".square");
        if(!square) {
            this.resetSquareColors();
            return;
        }

        //Moving
        this.movement(square);
        //Eating
        this.eating(square);


        //Check
        if(this.isCheck() === true) {
            this.check = true;
            document.querySelector(".check").classList.remove("hidden");
            if(this.isCheckMate())
                document.querySelector(".check").textContent = "CHECKMATE";
        }
        else {
            this.check = false;
            document.querySelector(".check").classList.add("hidden");
        }
        this.selectedObject = undefined;
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

    isSquareEmpty: (square) => !square?.querySelector("img") ? true : false,
    isKing: (square) => square.querySelector("img")?.getAttribute("src").includes("king"),
    isCheck: function () {
        let isCheck = false;
        
        this.piecesArray.forEach(piece => {
            //Highlight piece ValidMovements
            piece.displayValidMovements();

            //Loop through all squares and find out if any of them have validEatColor and king
            const squares = document.querySelectorAll(".square");
            squares.forEach(square => {
                if(square.style.background === this.validEatColor && this.isKing(square)) {
                    isCheck = true;
                }
            });

            this.resetSquareColors();
        });
        return isCheck;
    },

    isCheckMate: function() {
        let isCheckMate = true;
        for(let i = 0; i < this.piecesArray.length; i++) {
            const piece = this.piecesArray[i];
            if(piece.side !== this.turn)
                continue;

            piece.displayValidMovements();

            if(piece.type === "king") {
                this.piecesArray[i].removeKingsCheckSquares();
            }
            
            piece.willPieceDefendKing(this);

            const squares = document.querySelectorAll(".square");
            squares.forEach(square => {
                if(square.style.background === this.validEatColor || square.style.background === this.validMoveColor)
                    isCheckMate = false;
            });
            this.resetSquareColors();
        }

        return isCheckMate;
    },

};

class Piece {
    #locationId;
    #type;
    #side;
    #icon;
    #turnCount;
    constructor(locationId, type, side, icon) {
        this.#locationId = locationId;
        this.#type = type;
        this.#side = side;
        this.#icon = icon;
        this.#turnCount = 0;
    }

    isOwnUnit(square) {
        return square?.querySelector("img").getAttribute("src").includes(`${this.side}`) ? true : false;
    }

    getThisLocation() {
        let [i, j] = this.locationId.split(" ");
        i = parseInt(i);
        j = parseInt(j);
        return [i, j];

    }

    scanDirection(column, row, columnDirection, rowDirection) {
        let i = column + columnDirection;
        let j = row + rowDirection;

        while(i >= 0 && i < 8 && j >= 0 && j < 8) {
            const square = document.getElementById(`${i} ${j}`);

            //if square contains this object
            if(this.locationId === square.getAttribute("id"))
                continue;

            if(square.querySelector("img") && !this.isOwnUnit(square)) {
                square.style.background = chessBoard.validEatColor;
                break;
            }

            if(square.querySelector("img") && this.isOwnUnit(square)) {
                break;
            }

            square.style.background = chessBoard.validMoveColor;

            i += columnDirection;
            j += rowDirection;
        }
    }

    willPieceDefendKing(chessBoardObject) {
        const movementSquares = chessBoardObject.getAllMovementSquares();
        const validMovementSquares = [];

        movementSquares.forEach(square => {

            //Remove icon if it already has one
            let removedPiece = undefined;
            if(square.querySelector("img"))
                removedPiece = chessBoardObject.removeObjectFromArray(square);

            //append this piece to square
            square.appendChild(this.icon);
            
            chessBoardObject.resetSquareColors();
            //If not check then this square is valid
            if(!chessBoardObject.isCheck())
                validMovementSquares.push(square);

            //Append the removed icon back
            if(removedPiece) {
                square.appendChild(removedPiece.icon);
                chessBoardObject.piecesArray.push(removedPiece);
            }
        });
        //Append the piece back to it´s original location.
        document.getElementById(`${this.locationId}`).appendChild(this.icon);
        //Finally we can display all validMovements
        chessBoardObject.displayValidCheckDefendMovements(validMovementSquares);
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
    get locationId() {
        return this.#locationId;
    }
    set locationId(locationId) {
        this.#locationId = locationId;

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
        const [i, j] = this.getThisLocation();

        const firstSquare = document.getElementById(`${this.side === "white" ? i-1 : i+1} ${j}`);
        const secondSquare = document.getElementById(`${this.side === "white" ? i-2 : i+2} ${j}`);

        if(this.turnCount === 0 && chessBoard.isSquareEmpty(secondSquare) && chessBoard.isSquareEmpty(firstSquare))
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
        const [column, row] = this.getThisLocation();
        
        //Scan up
        this.scanDirection(column, row, -1, 0);
        
        //Scan down
        this.scanDirection(column, row, 1, 0);

        //Scan left
        this.scanDirection(column, row, 0, -1);

        //Scan right
        this.scanDirection(column, row, 0, 1);
    }
}

class Horse extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        const [column, row] = this.getThisLocation();

        const squarePositions = [
            [column-2, row+1],
            [column-2, row-1],
            [column-1, row+2],
            [column-1, row-2],
            [column+1, row+2],
            [column+1, row-2],
            [column+2, row+1],
            [column+2, row-1]
        ];

        squarePositions.forEach(position => {
            const square = document.getElementById(`${position[0]} ${position[1]}`);

            if(!square)
                return;

            if(square.querySelector("img") && !this.isOwnUnit(square))
                square.style.background = chessBoard.validEatColor;
            if(!square.querySelector("img"))
                square.style.background = chessBoard.validMoveColor;
        })
    }
}

class Bishop extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        const [column, row] = this.getThisLocation();
        
        //NorthEast
        this.scanDirection(column, row, -1, 1);

        //SouthEast
        this.scanDirection(column, row, 1, 1);

        //SouthWest
        this.scanDirection(column, row, 1, -1);

        //NorthWest
        this.scanDirection(column, row, -1, -1);
    }
}

class King extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        const [column, row] = this.getThisLocation();
        const squarePositions = [
            [column-1, row+1],
            [column, row+1],
            [column+1, row+1],
            [column+1, row],
            [column+1, row-1],
            [column, row-1],
            [column-1, row-1],
            [column-1, row]
        ];

        squarePositions.forEach(position => {
            const square = document.getElementById(`${position[0]} ${position[1]}`);

            if(!square)
                return;

            if(square.querySelector("img") && !this.isOwnUnit(square)) {
                square.style.background = chessBoard.validEatColor;
            }
            if(!square.querySelector("img")) {
                square.style.background = chessBoard.validMoveColor;
            }
        })
        
    }

    getCheckSquares() {
        //This function expects that the kings moves are highlighted in the board
        const checkSquares = [];
        const squares = [...document.querySelectorAll(".square")];
        
        //Get every kings possible movements in to movementSquares array
        const movementSquares = this.getAllPossibleKingsMovements(squares);
        chessBoard.resetSquareColors();
        this.checkIfMovementSquaresSafe(movementSquares, checkSquares);
        
        return checkSquares;
    }

    getAllPossibleKingsMovements(squares) {
        const movementSquares = squares.filter(square => {
            if(square.style.background === chessBoard.validMoveColor ||
                square.style.background === chessBoard.validEatColor)
                return square;
        });
        return movementSquares;
    }

    checkIfMovementSquaresSafe(movementSquares, checkSquares) {
        movementSquares.forEach(movementSquare => {

            //if there is a icon in the movementSquare, remove it temporarily.
            let removedPiece = undefined;
            if(movementSquare.querySelector("img"))
                removedPiece = this.removeIconTemporarily(movementSquare);

            //Append king to movementSquare
            movementSquare.appendChild(this.icon);

            //Check with every opposite side piece that if they threaten appended king
            this.checkForThreatsToKing(movementSquare, checkSquares, removedPiece);

            //Remove appended king
            document.getElementById(this.locationId).appendChild(this.icon);
            if(removedPiece)
                this.appendBackRemovedPiece(removedPiece);
        });
    }

    checkForThreatsToKing(movementSquare, checkSquares, removedPiece) {
        chessBoard.piecesArray.forEach(piece => {
            if(piece.side !== this.side && piece !== removedPiece)
                piece.displayValidMovements();

            if(movementSquare.style.background === chessBoard.validEatColor) {
                checkSquares.push(movementSquare);
            }
            chessBoard.resetSquareColors();
        });
    }

    removeIconTemporarily(square) {
        const piece = chessBoard.piecesArray.find(piece => {
            if(piece.icon === square.querySelector("img"))
                return piece.icon;
        });
        square.removeChild(square.querySelector("img"));
        return piece;
    }

    appendBackRemovedPiece(removedPiece) {
        const locationId = removedPiece.locationId;
        document.getElementById(`${locationId}`).appendChild(removedPiece.icon);
    }

    removeKingsCheckSquares() {
        const checkSquares = this.getCheckSquares();
            
        if(checkSquares.length > 0) {
            this.displayValidMovements();
            checkSquares.forEach(square => {
                const [column, row] = square.getAttribute("id").split(" ");
                square.style.background = chessBoard.squareColors[column][row];
            })
        } else {
            this.displayValidMovements();
        }
    }
}

class Queen extends Piece {
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
    }

    displayValidMovements() {
        const [column, row] = this.getThisLocation();

        //NorthEast
        this.scanDirection(column, row, -1, 1);

        //SouthEast
        this.scanDirection(column, row, 1, 1);

        //SouthWest
        this.scanDirection(column, row, 1, -1);

        //NorthWest
        this.scanDirection(column, row, -1, -1);

        //Scan up
        this.scanDirection(column, row, -1, 0);
        
        //Scan down
        this.scanDirection(column, row, 1, 0);

        //Scan left
        this.scanDirection(column, row, 0, -1);

        //Scan right
        this.scanDirection(column, row, 0, 1);

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