
const chessBoard = {
    selectedObject: undefined,
    squareColors: [],
    squareIds: [],
    piecesArray: [], //For storing all the piece objects
    turn: "white",
    selectionColor: "rgba(239, 242, 22, 1)",
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

        if(this.isCheckMate())
            document.querySelector(".check").textContent = "CHECKMATE";

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
        if(!iconContainer) return;

        // Select the object that needs to be transformed
        const soldierToTransform = this.piecesArray.find(piece => piece.transformPiece);
        const soldierLocationSquare = document.getElementById(soldierToTransform.locationId);
        this.removeObjectFromArray(soldierLocationSquare);
        
        if(soldierToTransform) {
            soldierToTransform.icon = iconContainer.querySelector("img");
            soldierToTransform.transformIcon = false;
            this.hidePieceTypeOptionMenu();
            soldierLocationSquare.removeChild(soldierLocationSquare.querySelector("img"));

            //Create a new object and place it to the board
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