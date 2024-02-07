"use strict"

class Piece {
    #owner;
    #locationId;
    #type;
    #side;
    #icon;
    #turnCount;
    constructor(locationId, type, side, icon, mainMenu) {
        this.#locationId = locationId;
        this.#type = type;
        this.#side = side;
        this.#icon = icon;
        this.#turnCount = 0;
        this.#owner = this.defineOwner(mainMenu);
    }

    defineOwner(mainMenu) {

        let owner;
        if(this.side === mainMenu.opponentSide) {
            owner = mainMenu.opponent;
        } else {
            owner = mainMenu.player;
        }
        return owner;
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
                square.style.background = chessBoard.dom.validEatColor;
                break;
            }

            if(square.querySelector("img") && this.isOwnUnit(square)) {
                break;
            }

            square.style.background = chessBoard.dom.validMoveColor;

            i += columnDirection;
            j += rowDirection;
        }
    }

    willPieceDefendKing(chessBoard) {
        const movementSquares = chessBoard.dom.getAllMovementSquares();
        const validMovementSquares = [];

        //Need to save redSquares for displayValidCheckDefendMovements function
        const redSquares = this.getAllRedSquares(movementSquares, chessBoard);

        movementSquares.forEach(square => {

            //Remove icon if square already has one
            let removedPiece = undefined;
            if(square.querySelector("img"))
                removedPiece = chessBoard.removeObjectFromArray(square);

            square.appendChild(this.icon);

            if(!chessBoard.isCheck())
                validMovementSquares.push(square);

            //Append the removed icon back
            if(removedPiece) {
                square.appendChild(removedPiece.icon);
                chessBoard.piecesArray.push(removedPiece);
            }
        });
        //Append the piece back to it´s original location.
        document.getElementById(`${this.locationId}`).appendChild(this.icon);
        //Finally we can display all validMovements
        chessBoard.dom.displayValidCheckDefendMovements(validMovementSquares, redSquares);
    }

    getAllRedSquares(squares, chessBoardObject) {
        const redSquares = [];
        squares.forEach(square => {
            if(square.style.background === chessBoardObject.dom.validEatColor)
                redSquares.push(square);
        });
        return redSquares;
    }

    getAllPossibleMovements(squares) {
        return squares.filter(square => {
            if(square.style.background === chessBoard.dom.validMoveColor || square.style.background === chessBoard.dom.validEatColor)
                return square;
        });
    }
    /**
     * tekee jotai
     * @param {*} square no vittu neliö ootko idiootti
     * @returns Jota
     */
    removeIconTemporarily(square) {
        const piece = chessBoard.piecesArray.find(piece => {
            if(piece.icon === square.querySelector("img"))
                return piece.icon;
        });
        square.removeChild(square.querySelector("img"));
        return piece;
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

    get locationId() {
        return this.#locationId;
    }

    get turnCount() {
        return this.#turnCount;
    }

    get icon() {
        return this.#icon;
    }

    get owner() {
        return this.#owner;
    }

    set side(side) {
        this.#side = side;
    }
    set locationId(locationId) {
        this.#locationId = locationId;

    }

    set icon(icon) {
        this.#icon = icon;
    }

    set turnCount(turnCount) {
        this.#turnCount = turnCount;
    }

    set owner(owner) {
        this.#owner = owner;
    }
}

class Soldier extends Piece {
    #transformPiece;
    #enPassant;
    #secondSquare;
    #pieceIsInSecondSquare;
    constructor(locationId, type, side, icon, mainMenu)
    {
        super(locationId, type, side, icon, mainMenu);
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

        if(!firstSquare) return;

        if(this.turnCount === 0 && chessBoard.dom.isSquareEmpty(secondSquare) && chessBoard.dom.isSquareEmpty(firstSquare)) {
            secondSquare.style.background = chessBoard.dom.validMoveColor;
        }

        if (chessBoard.dom.isSquareEmpty(firstSquare))
            firstSquare.style.background = chessBoard.dom.validMoveColor;
        
        const rightCorner = this.side === "white" ?
            document.getElementById(`${i-1} ${j+1}`) : document.getElementById(`${i+1} ${j-1}`);
        const leftCorner = this.side === "white" ? 
            document.getElementById(`${i-1} ${j-1}`) : document.getElementById(`${i+1} ${j+1}`);

        //Does square have icon and is it own side
        if(leftCorner?.querySelector("img") &&  !this.isOwnUnit(leftCorner))
            leftCorner.style.background = chessBoard.dom.validEatColor;

        if(rightCorner?.querySelector("img") && !this.isOwnUnit(rightCorner))
            rightCorner.style.background = chessBoard.dom.validEatColor;
        
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
                square.style.background = chessBoard.dom.validEatColor;
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
    constructor(locationId, type, side, icon, mainMenu)
    {
        super(locationId, type, side, icon, mainMenu);
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
    constructor(locationId, type, side, icon, mainMenu)
    {
        super(locationId, type, side, icon, mainMenu);
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
                square.style.background = chessBoard.dom.validEatColor;
            if(!square.querySelector("img"))
                square.style.background = chessBoard.dom.validMoveColor;
        })
    }
}

class Bishop extends Piece {
    constructor(locationId, type, side, icon, mainMenu)
    {
        super(locationId, type, side, icon, mainMenu);
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
    constructor(locationId, type, side, icon, mainMenu)
    {
        super(locationId, type, side, icon, mainMenu);
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
                square.style.background = chessBoard.dom.validEatColor;
            }
            if(!square.querySelector("img")) {
                square.style.background = chessBoard.dom.validMoveColor;
            }
        });
        
    }

    removeKingsCheckSquares() {
        const checkSquares = this.getCheckSquares();
            
        if(checkSquares.length === 0)
            return;

        checkSquares.forEach(square => {
            const [column, row] = square.getAttribute("id").split(" ");
            square.style.background = chessBoard.dom.squareColors[column][row];
        });
    }

    getCheckSquares() {
        //This function expects that the kings moves are highlighted in the board
        const squares = [...document.querySelectorAll(".square")];
        
        const movementSquares = this.getAllPossibleMovements(squares);
        return this.filterAllCheckSquares(movementSquares);
    }

    filterAllCheckSquares(movementSquares) {
        const checkSquares = [];
        chessBoard.dom.resetSquareColors();
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

            //Append the removedPiece
            if(removedPiece) this.appendBackRemovedPiece(removedPiece);
        });
        //Now that we have checkSquares. We can displayValidMovements again
        this.displayValidMovements();
        return checkSquares;
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
            if(!chessBoardObject.dom.isSquareEmpty(castleSquareNear) || !chessBoardObject.dom.isSquareEmpty(castleSquareFar)) {
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
                castleSquareFar.style.background = chessBoardObject.dom.validMoveColor;
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
        chessBoard.dom.resetSquareColors();
        chessBoardObject.piecesArray.forEach(piece => {
            if(piece.side !== chessBoardObject.turn) {
                piece.displayValidMovements();
                if(square.style.background === chessBoardObject.dom.validEatColor || square.style.background === chessBoardObject.dom.validMoveColor) {
                    squareIsSafe = false;
                }
                chessBoardObject.dom.resetSquareColors();
            }
        });
        return squareIsSafe;
    }
}

class Queen extends Piece {
    constructor(locationId, type, side, icon, mainMenu)
    {
        super(locationId, type, side, icon, mainMenu);
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