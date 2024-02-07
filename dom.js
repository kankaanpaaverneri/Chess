"use strict"

class DOM {
    #squareColors;
    #squareIds;
    #selectionColor;
    #validMoveColor;
    #validEatColor;
    constructor() {
        this.#squareColors = [];
        this.#squareIds = [];
        this.selectionColor = "yellow";
        this.validMoveColor = "green";
        this.validEatColor = "red";
    }

    createChessboard() {
        const chessBoardContainer = document.querySelector(".chessboard-container");
        for(let column = 0; column < 8; column++) {
            const isColumnOdd = column % 2 == 1;
            const squareColorsRow = [];
            for(let row = 0; row < 8; row++) {
                const squareColor = row % 2 == isColumnOdd ? "grey" : "white";
                const html = `<div id="${column} ${row}" class="square" style="background-color: ${squareColor};"></div>`;
                chessBoardContainer.insertAdjacentHTML("beforeend", html);
                squareColorsRow.push(squareColor);
                this.squareIds.push(`${column} ${row}`);
            }
            this.squareColors.push(squareColorsRow);
        }
    }

    resetSquareColors() {
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                const square = document.getElementById(`${i} ${j}`);
                square.style.background = this.squareColors[i][j];
            }
        }
    }
    //Generate html for adding icons to the chessboard
    addIconsToBoard() {
        const pieces = ["tower", "horse", "bishop", "king", "queen", "bishop", "horse", "tower"];
        for(let row = 0; row < 8; row++) {
            document.getElementById(`1 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/soldier_black.svg">`);
            document.getElementById(`6 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/soldier_white.svg">`);
            document.getElementById(`0 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/${pieces[row]}_black.svg">`);
            document.getElementById(`7 ${row}`).insertAdjacentHTML("beforeend", `<img src="icons/${pieces[row]}_white.svg">`);
        }
    }

    highlightSquare(target) {
        const square = target.closest(".square");
        square.style.background = this.selectionColor;
    }

    switchTurnText(chessBoard) {
        document.querySelector(".turn-value").textContent = chessBoard.turn.toUpperCase();
    }

    eat(square, selectedObject) {
        square.removeChild(square.querySelector("img"));
        square.append(selectedObject.icon);
        selectedObject.locationId = square.getAttribute("id");
    }

    move(square, selectedObject) {
        square.append(selectedObject.icon);
        selectedObject.locationId = square.getAttribute("id");
    }

    castle(chessBoard) {
        const towerSquare = document.getElementById(`${chessBoard.turn === "white" ? 7 : 0} ${0}`);
        const towerMovementSquare = document.getElementById(`${chessBoard.turn === "white" ? 7 : 0} ${2}`);

        const towerIcon = towerSquare.querySelector("img");
        towerMovementSquare.appendChild(towerIcon);
        const tower = chessBoard.findObjectFromArray(towerSquare, towerIcon);
        tower.locationId = towerMovementSquare.getAttribute("id");
        return tower;
    }

    displayCheckMate() {
        document.querySelector(".check").textContent = "CHECKMATE";
    }

    generatePieceTypeOptionMenu(chessBoard) {
        const pieceTypeOptionMenu = document.createElement("div");
        pieceTypeOptionMenu.classList.add("piece-type-option-menu");
        pieceTypeOptionMenu.classList.add("hidden");
        document.querySelector("body").insertAdjacentElement("beforeend", pieceTypeOptionMenu);

        const pieceTypes = ["tower", "horse", "bishop", "queen"];
        for(let i = 0; i < pieceTypes.length; i++) {
            const html = `
            <div class="icon-container">
            <img class="icon" src="icons/${pieceTypes[i]}_${chessBoard.turn === "white" ? "black" : "white"}.svg">
            </div>`;
            pieceTypeOptionMenu.insertAdjacentHTML("beforeend", html);
        }
        pieceTypeOptionMenu.classList.remove("hidden");
    }

    hidePieceTypeOptionMenu() {
        const pieceTypeOptionMenu = document.querySelector(".piece-type-option-menu");
        pieceTypeOptionMenu.parentNode.removeChild(pieceTypeOptionMenu);
        pieceTypeOptionMenu.classList.add("hidden");
    }

    findClickedPiece(target, chessBoard) {
        console.log(target, chessBoard);
        return chessBoard.piecesArray.find(piece => {
            if(piece.icon === target && piece.icon.getAttribute("src").includes(`${chessBoard.turn}`))
                return piece;
        });
    }

    getAllMovementSquares() {
        const allSquares = document.querySelectorAll(".square");
        const movementSquares = [];
        allSquares.forEach(square => {
            if(square.style.background === this.validEatColor || square.style.background === this.validMoveColor) {
                movementSquares.push(square);
            }
        });
        return movementSquares;
    }

    isSoldierInSecondSquare(selectedObject) {
        const isCurrentLocationSecondSquare = selectedObject.locationId === selectedObject.secondSquare?.getAttribute("id");
        if(isCurrentLocationSecondSquare) {
            return true;
        }
        return false;
    }

    displayCheckStatus(chessBoard) {
        const checkText = document.querySelector(".check");
        if(chessBoard.check) {
            checkText.classList.remove("hidden");
        }
        else {
            checkText.classList.add("hidden");
        }
    }

    isSquareEmpty(square) {
        return !square?.querySelector("img") ? true : false;
    }

    isKing(square) {
        return square.querySelector("img")?.getAttribute("src").includes("king");
    }

    transformSoldier(target, chessBoard) {
        const iconContainer = target.closest(".icon-container");
        if(!iconContainer) return [];

        const soldierToTransform = chessBoard.piecesArray.find(piece => piece.transformPiece);
        const soldierLocationSquare = document.getElementById(soldierToTransform.locationId);
        chessBoard.removeObjectFromArray(soldierLocationSquare);
        soldierToTransform.icon = iconContainer.querySelector("img");
        chessBoard.hidePieceTypeOptionMenu();
        soldierLocationSquare.removeChild(soldierLocationSquare.querySelector("img"));

        //Create a new object and place it to the board
        const newPieceIcon = document.createElement("img");
        newPieceIcon.src = iconContainer.querySelector("img").getAttribute("src");
        soldierLocationSquare.appendChild(newPieceIcon);

        return [soldierToTransform, soldierLocationSquare, newPieceIcon];
    }

    defineObjectProperties(soldierLocationSquare) {
        const icon = soldierLocationSquare.querySelector("img");
        if(!icon) return [];

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

         return [side, pieceType, locationId, icon];

    }

    enPassant(square, chessBoard) {
        square.append(chessBoard.selectedObject.icon);
        chessBoard.selectedObject.locationId = square.getAttribute("id");
        const [column, row] = chessBoard.selectedObject.getThisLocation();
        const enemySquare = document.getElementById(`${chessBoard.selectedObject.side === "white" ? column + 1 : column - 1} ${row}`);
        chessBoard.removeObjectFromArray(enemySquare);
        enemySquare.removeChild(enemySquare.querySelector("img"));
        this.resetSquareColors();
    }

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
    }

    get squareColors() {
        return this.#squareColors;
    }

    get squareIds() {
        return this.#squareIds;
    }

    get selectionColor() {
        return this.#selectionColor;
    }

    get validMoveColor() {
        return this.#validMoveColor;
    }

    get validEatColor() {
        return this.#validEatColor;
    }

    set squareColors(squareColors) {
        this.#squareColors = squareColors;
    }

    set squareIds(squareIds) {
        this.#squareIds = squareIds;
    }

    set selectionColor(selectionColor) {
        this.#selectionColor = selectionColor;
    }

    set validMoveColor(validMoveColor) {
        this.#validMoveColor = validMoveColor;
    }

    set validEatColor(validEatColor) {
        this.#validEatColor = validEatColor;
    }
};