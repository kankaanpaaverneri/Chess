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
    castleSquares: [],
    pieceTypeOptionMenuDisplayed: false,

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
            this.castleSquares = pieceObject.displayCastleMoves(this);
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
        if(!pieceToRemove)
            return pieceToRemove;

        const index = this.piecesArray.indexOf(pieceToRemove);
        this.piecesArray.splice(index, 1);
        return pieceToRemove;
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
        if(square.style.background === this.validEatColor && square.querySelector("img")) {
            const removedPiece = this.removeObjectFromArray(square);
            square.append(this.selectedObject.icon);
            square.removeChild(square.querySelector("img"));
            this.selectedObject.locationId = square.getAttribute("id");
            chessBoard.turn = chessBoard.turn === "white" ? "black" : "white";
            this.selectedObject.turnCount++;
            document.querySelector(".turn-value").textContent = this.turn.toUpperCase();
            this.resetSquareColors();
        } else if(square.style.background === this.validEatColor) {
            //EnPassant
            this.enPassant(square);
        }
    },

    castle(square) {

        if(this.castleSquares.length === 0)
            return;

        //Assumes that tower is in place
        const towerSquare = document.getElementById(`${this.turn === "white" ? 7 : 0} ${0}`);
        const towerMovementSquare = document.getElementById(`${this.turn === "white" ? 7 : 0} ${2}`);

        const tower = this.piecesArray.find(piece => {
            if(piece.icon === towerSquare.querySelector("img") && piece.locationId === towerSquare.getAttribute("id"))
                return piece;
        });

        towerMovementSquare.appendChild(tower.icon);
        tower.locationId = towerMovementSquare.getAttribute("id");
        tower.turnCount++;
    },

    movePiece(target) {
        const square = target.closest(".square");
        if(!square) {
            this.resetSquareColors();
            return;
        }


        //Castle
        if(square === this.castleSquares[1] && square.style.background === this.validMoveColor)
            this.castle(square);

        //Moving
        this.movement(square);

        //Is movement to secondSquare has been made
        if(this.selectedObject.turnCount === 1)
            this.isSoldierInSecondSquare();

        //Eating
        this.eating(square);


        if(this.selectedObject.type === "soldier")
            this.isSoldierInEndSquare();

        //Check
        this.checkCheckStatus();

        this.selectedObject = undefined;
    },

    isSoldierInSecondSquare() {
        if(this.selectedObject.locationId === this.selectedObject.secondSquare?.getAttribute("id")) {
            this.selectedObject.pieceIsInSecondSquare = true;
        } else if(this.selectedObject.locationId === this.selectedObject.secondSquare?.getAttribute("id") && this.selectedObject.pieceIsInSecondSquare === true) {
            this.selectedObject.pieceIsInSecondSquare = false;
        }
    },

    checkCheckStatus() {
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
    },



    createNewObject(side, pieceType, locationId, img) {
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

            const objectProperties = this.defineObjectProperties(img);


            //Create a new object
            let piece = this.createNewObject(...objectProperties, img);
            this.piecesArray.push(piece);
        })
    },

    isSquareEmpty: (square) => !square?.querySelector("img") ? true : false,
    isKing: (square) => square.querySelector("img")?.getAttribute("src").includes("king"),
    isCheck: function () {
        let isCheck = false;
        
        this.piecesArray.forEach(piece => {
            if(piece.side !== this.turn) {
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
            }
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

    generatePieceTypeOptionMenu() {
        const pieceTypeOptionMenu = document.createElement("div");
        pieceTypeOptionMenu.classList.add("piece-type-option-menu");
        pieceTypeOptionMenu.classList.add("hidden");
        document.querySelector("body").insertAdjacentElement("beforeend", pieceTypeOptionMenu);

        const pieceTypes = ["tower", "horse", "bishop", "queen"];
        for(let i = 0; i < pieceTypes.length; i++) {
            const html = `
            <div class="icon-container">
            <img class="icon" src="icons/${pieceTypes[i]}_${this.turn === "white" ? "black" : "white"}.svg">
            </div>`;
            pieceTypeOptionMenu.insertAdjacentHTML("beforeend", html);
        }
    },

    isSoldierInEndSquare() {
        const [column, row] = this.selectedObject.getThisLocation();
        if(column === 0 || column === 7) {
            //If we are with the soldier at the end of the chessBoard
            this.displayPieceTypeOptionMenu(this.selectedObject);
        }
    },

    displayPieceTypeOptionMenu(soldier) {
        this.generatePieceTypeOptionMenu();
        const pieceTypeOptionMenu = document.querySelector(".piece-type-option-menu");
        pieceTypeOptionMenu.classList.remove("hidden");
        this.pieceTypeOptionMenuDisplayed = true;
        soldier.transformPiece = true;
    },

    hidePieceTypeOptionMenu() {
        const pieceTypeOptionMenu = document.querySelector(".piece-type-option-menu");
        pieceTypeOptionMenu.parentNode.removeChild(pieceTypeOptionMenu);
        pieceTypeOptionMenu.classList.add("hidden");
        this.pieceTypeOptionMenuDisplayed = false;
    },

    transformSoldier(target) {
        const iconContainer = target.closest(".icon-container");
        if(!iconContainer)
            return;

        const soldierToTransform = this.piecesArray.find(piece => piece.transformPiece);
        const soldierLocationSquare = document.getElementById(soldierToTransform.locationId);
        this.removeObjectFromArray(soldierLocationSquare);

        if(soldierToTransform) {
            soldierToTransform.icon = iconContainer.querySelector("img");
            soldierToTransform.transformIcon = false;
            this.hidePieceTypeOptionMenu();
            soldierLocationSquare.removeChild(soldierLocationSquare.querySelector("img"));

            //Find out what type of object you need to create
            const newPieceIcon = document.createElement("img");
            newPieceIcon.src = iconContainer.querySelector("img").getAttribute("src");
            soldierLocationSquare.appendChild(newPieceIcon);
            const objectProperties = this.defineObjectProperties(soldierLocationSquare.querySelector("img"));
            const newPieceObject = this.createNewObject(...objectProperties, newPieceIcon);
            this.piecesArray.push(newPieceObject);

            this.checkCheckStatus();
        }
    },

    defineObjectProperties(icon) {
        //Define piece side
        const side = icon.getAttribute("src").includes("white") ? "white" : "black";

         //Define pieceType
         const pieceTypes = ["tower", "horse", "bishop", "king", "queen", "soldier"];
         const [pieceType] = pieceTypes.filter(pieceType => {
             if(icon.getAttribute("src").includes(pieceType))
                 return pieceType;
         });

         //Define initial locationId
         const locationId = icon.closest(".square").getAttribute("id");

         return [side, pieceType, locationId];

    },

    findObjectFromArray(square, icon) {
        return this.piecesArray.find(piece => {
            if(piece.icon === icon && piece.locationId === square.getAttribute("id"))
                return piece;
        });
    },

    displayValidCheckDefendMovements(validMovementSquares, redSquares) {
        validMovementSquares.forEach(square => {
            if(square.querySelector("img"))
                square.style.background = this.validEatColor;
            else
                square.style.background = this.validMoveColor;
            
            redSquares.forEach(redSquare => {
                if(redSquare === square) {
                    square.style.background = this.validEatColor;
                }
            })
        });
    },

    enPassant(square) {
        square.append(this.selectedObject.icon);
        this.selectedObject.locationId = square.getAttribute("id");
        const [column, row] = this.selectedObject.getThisLocation();
        chessBoard.turn = chessBoard.turn === "white" ? "black" : "white";
        this.selectedObject.turnCount++;
        document.querySelector(".turn-value").textContent = this.turn.toUpperCase();
        const enemySquare = document.getElementById(`${this.selectedObject.side === "white" ? column + 1 : column - 1} ${row}`);
        this.removeObjectFromArray(enemySquare);
        enemySquare.removeChild(enemySquare.querySelector("img"));
        this.resetSquareColors();
    }

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

        //Need to save redSquares for displayValidCheckDefendMovements function
        const redSquares = this.getAllRedSquares(movementSquares, chessBoardObject);

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
        chessBoardObject.displayValidCheckDefendMovements(validMovementSquares, redSquares);
    }

    getAllRedSquares(squares, chessBoardObject) {
        const redSquares = [];
        squares.forEach(square => {
            if(square.style.background === chessBoardObject.validEatColor)
                redSquares.push(square);
        });
        return redSquares;
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
    #transformPiece;
    #enPassant;
    #secondSquare;
    #pieceIsInSecondSquare;
    constructor(locationId, type, side, icon)
    {
        super(locationId, type, side, icon);
        this.#transformPiece = false;
        this.#enPassant = false;
        this.#pieceIsInSecondSquare = false;
        this.#secondSquare = this.defineSecondSquare();
    }

    get transformPiece() {
        return this.#transformPiece;
    }

    get enPassant() {
        return this.#enPassant;
    }

    get pieceIsInSecondSquare() {
        return this.#pieceIsInSecondSquare;
    }

    get secondSquare() {
        return this.#secondSquare;
    }

    set transformPiece(transfromPiece) {
        this.#transformPiece = transfromPiece;
    }

    set enPassant(enPassant) {
        this.#enPassant = enPassant;
    }

    set pieceIsInSecondSquare(pieceIsInSecondSquare) {
        this.#pieceIsInSecondSquare = pieceIsInSecondSquare;
    }
    
    set secondSquare(secondSquare) {
        this.#secondSquare = secondSquare;
    }

    defineSecondSquare() {
        const [i, j] = this.getThisLocation();
        return document.getElementById(`${this.side === "white" ? i-2 : i+2} ${j}`);
    }

    displayValidMovements() {
        const [i, j] = this.getThisLocation();

        const firstSquare = document.getElementById(`${this.side === "white" ? i-1 : i+1} ${j}`);
        const secondSquare = document.getElementById(`${this.side === "white" ? i-2 : i+2} ${j}`);

        //switch soldier to a new object
        if(!firstSquare) {       
            return;
        }

        if(this.turnCount === 0 && chessBoard.isSquareEmpty(secondSquare) && chessBoard.isSquareEmpty(firstSquare)) {
            secondSquare.style.background = chessBoard.validMoveColor;
        }

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
        
        const piecesMovedTwoSquares = this.isEnPassantPossible();
        if(piecesMovedTwoSquares.length > 0)
        {
            this.displayEnPassantMoves(piecesMovedTwoSquares);
        }
        
    }

    displayEnPassantMoves(piecesMovedTwoSquares) {
        piecesMovedTwoSquares.forEach(piece => {
            const [column, row] = piece.getThisLocation();
            const square = document.getElementById(`${piece.side === "white" ? column + 1 : column - 1} ${row}`);
            if(square) {
                square.style.background = chessBoard.validEatColor;
            }
        })
    }

    isEnPassantPossible() {
        const [column, row] = this.getThisLocation();
        if((column === 3 && this.side === "white") || (column === 4 && this.side === "black")) {
            //Returns array of squares of which have soldier in them
            const leftAndRightSquaresArray = this.isEnemySoldierNext(column, row);
            return this.hasSoldierMovedTwoSquares(leftAndRightSquaresArray);
        }
        
        return false;
    }

    

    isEnemySoldierNext(column, row) {
        const leftSquare = document.getElementById(`${column} ${row - 1}`);
        const rightSquare = document.getElementById(`${column} ${row + 1}`);

        const leftAndRightSquares = [];

        const leftIcon = leftSquare?.querySelector("img");
        const rightIcon = rightSquare?.querySelector("img");

        if(leftIcon && leftIcon.getAttribute("src").includes("soldier") && this.getSoldierSide(leftIcon) !== this.side)
            leftAndRightSquares.push(leftSquare);

        if(rightIcon && rightIcon.getAttribute("src").includes("soldier") && this.getSoldierSide(rightIcon) !== this.side)
            leftAndRightSquares.push(rightSquare);

        return leftAndRightSquares;
    }

    hasSoldierMovedTwoSquares(leftAndRightSquares) {
        let piecesMovedTwoSquares = [];
        //If empty return false
        if(leftAndRightSquares.length === 0)
            return piecesMovedTwoSquares;

        //Otherwise find right object for icon and check if it has enPassant property true
        leftAndRightSquares.forEach(square => {
            const pieceObject = chessBoard.findObjectFromArray(square, square.querySelector("img"));
            if(pieceObject?.pieceIsInSecondSquare === true)
                piecesMovedTwoSquares.push(pieceObject);
        });
        return piecesMovedTwoSquares;
    }

    getSoldierSide(icon) {
        return icon.getAttribute("src").includes("white") ? "white" : "black";
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
        });
        
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
            if(movementSquare.querySelector("img")) {
                removedPiece = this.removeIconTemporarily(movementSquare);
            }
            //Append king to movementSquare
            movementSquare.appendChild(this.icon);

            //Check with every opposite side piece that if they threaten the appended king
            if(!this.isSquareSafe(movementSquare, chessBoard))
                checkSquares.push(movementSquare);

            //Remove appended king
            document.getElementById(this.locationId).appendChild(this.icon);
            if(removedPiece)
                this.appendBackRemovedPiece(removedPiece);
        });
        return checkSquares;
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

    displayCastleMoves(chessBoardObject) {
        let castleSquares = [];
        if(this.turnCount === 0 && !chessBoardObject.check) {
            const [thisPositionColumn, thisPositionRow] = this.getThisLocation();
            const castleSquareNear = document.getElementById(`${thisPositionColumn} ${thisPositionRow - 1}`);
            const castleSquareFar = document.getElementById(`${thisPositionColumn} ${thisPositionRow - 2}`);
            const castleSquareTower = document.getElementById(`${thisPositionColumn} ${thisPositionRow -3}`);
            if(!chessBoardObject.isSquareEmpty(castleSquareNear) || !chessBoardObject.isSquareEmpty(castleSquareFar)) {
                this.displayValidMovements();
                return castleSquares;
            }
            if(!this.isSquareSafe(castleSquareNear, chessBoardObject)) {
                this.displayValidMovements();
                return castleSquares;
            }
            if(!this.isSquareSafe(castleSquareFar, chessBoardObject)) {
                this.displayValidMovements();
                return castleSquares;
            }

            //Checks if there is a tower and if it has moved
            if(castleSquareTower.querySelector("img")?.getAttribute("src").includes(`tower_${this.side}.svg`) &&
                this.isTowerMoved(castleSquareTower.querySelector("img"), castleSquareTower, chessBoardObject)) {
                castleSquareFar.style.background = chessBoardObject.validMoveColor;
                castleSquares = [castleSquareNear, castleSquareFar];
            }
            this.displayValidMovements();
        }
        return castleSquares;
    }

    isTowerMoved(towerIcon, towerSquare, chessBoardObject) {
        const towerObject = chessBoardObject.piecesArray.find(piece => {
            if(piece.icon === towerIcon && piece.locationId === towerSquare.getAttribute("id"))
                return piece;
        });

        return towerObject.turnCount > 0 ? false : true;
    }

    isSquareSafe(square, chessBoardObject) {
        let squareIsSafe = true;
        chessBoard.resetSquareColors();
        chessBoardObject.piecesArray.forEach(piece => {
            if(piece.side !== chessBoardObject.turn) {
                piece.displayValidMovements();
                if(square.style.background === chessBoardObject.validEatColor || square.style.background === chessBoardObject.validMoveColor) {
                    squareIsSafe = false;
                }
                chessBoardObject.resetSquareColors();
            }
        });
        return squareIsSafe;
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

    if(chessBoard.pieceTypeOptionMenuDisplayed) {
        chessBoard.transformSoldier(e.target);
    }

    if(chessBoard.selectedObject)
        chessBoard.movePiece(e.target);
    else
        chessBoard.selectedObject = chessBoard.selectPiece(e.target);
    
});