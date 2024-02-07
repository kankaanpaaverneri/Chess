
const chessBoard = {
    selectedObject: undefined,
    piecesArray: [], //For storing all the piece objects
    turn: "white",
    check: false,
    checkMate: false,
    castleSquares: [],
    pieceTypeOptionMenuDisplayed: false,
    dom: new DOM(),

    selectPiece: function (target) {
        this.dom.resetSquareColors();
        this.selectedObject = undefined;

        //Find right pieceObject
        const piece = this.dom.findClickedPiece(target, this);
        if(!piece) return null;
        piece.displayValidMovements();

        if(piece.type === "king") {
            piece.removeKingsCheckSquares();
            this.castleSquares = piece.displayCastleMoves(this);
        }

        piece.willPieceDefendKing(this);

        //Highlight selected square
        this.dom.highlightSquare(target);
        return piece;
    },

    removeObjectFromArray(square) {
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
        if(square.style.background === this.dom.validMoveColor) {
            this.dom.move(square, this.selectedObject);
            return true;
        }
        return false;
    },

    eating(square) {
        if(square.style.background === this.dom.validEatColor && square.querySelector("img")) {
            const removedPiece = this.removeObjectFromArray(square);
            this.dom.eat(square, this.selectedObject);
            this.dom.resetSquareColors();
            return true;
        } else if(square.style.background === this.dom.validEatColor) {
            //EnPassant
            this.dom.enPassant(square, this);
            return true;
        }
        return false;
    },

    castle() {
        if(this.castleSquares.length === 0)
            return;

        //Move towerIcon
        const tower = this.dom.castle(this);
        tower.turnCount++;
    },

    switchTurn() {
        this.turn = this.turn === "white" ? "black" : "white";
        this.selectedObject.turnCount++;
        this.dom.switchTurnText(this);
    },

    movePieceToClickedSquare(target) {
        const square = target.closest(".square");
        if(!square) {
            this.dom.resetSquareColors();
            return;
        }

        this.movePiece(square);
    },

    movePiece(square) {
        //Castle
        if(square === this.castleSquares[1] && square.style.background === this.dom.validMoveColor)
            this.castle();

        //Moving
        if(this.movement(square)) {
            this.switchTurn();
        }

        //Has movement to secondSquare been made
        if(this.selectedObject.turnCount === 1)
            this.selectedObject.pieceIsInSecondSquare = this.dom.isSoldierInSecondSquare(this.selectedObject);

        //Eating
        if(this.eating(square)) {
            this.switchTurn();
        }

        //Is soldier in end square
        if(this.selectedObject.type === "soldier")
            this.isSoldierInEndSquare();

        //Check
        this.check = this.isCheck();
        this.dom.displayCheckStatus(this);

        if(this.isCheckMate())
            this.dom.displayCheckMate();

        this.selectedObject = undefined;
    },



    createNewObject(side, pieceType, locationId, img, mainMenu) {
        let piece;
        switch(pieceType) {
            case "soldier":
                piece = new Soldier(locationId, pieceType, side, img, mainMenu);
                break;
            case "tower":
                piece = new Tower(locationId, pieceType, side, img, mainMenu);
                break;
            case "horse":
                piece = new Horse(locationId, pieceType, side, img, mainMenu);
                break;
            case "bishop":
                piece = new Bishop(locationId, pieceType, side, img, mainMenu);
                break;
            case "king":
                piece = new King(locationId, pieceType, side, img, mainMenu);
                break;
            case "queen":
                piece = new Queen(locationId, pieceType, side, img, mainMenu);
                break; 
        }
        return piece;
    },

    //Function initializes 32 piece objects
    initPieceObjects: function (mainMenu) {
        const squares = document.querySelectorAll(".square");
        squares.forEach(square => {
            const objectProperties = this.dom.defineObjectProperties(square);
            if(objectProperties.length > 0) {
                //Create a new object
                let piece = this.createNewObject(...objectProperties, mainMenu);
                this.piecesArray.push(piece);
            }
        })
    },
    isCheck: function () {
        let isCheck = false;
        this.dom.resetSquareColors();
        
        this.piecesArray.forEach(piece => {
            if(piece.side !== this.turn) {
                //Highlight piece ValidMovements
                piece.displayValidMovements();

                //Loop through all squares and find out if any of them have validEatColor and king
                const squares = document.querySelectorAll(".square");
                squares.forEach(square => {
                    if(square.style.background === this.dom.validEatColor && this.dom.isKing(square)) {
                        isCheck = true;
                    }
                });
                this.dom.resetSquareColors();
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
                if(square.style.background === this.dom.validEatColor || square.style.background === this.dom.validMoveColor)
                    isCheckMate = false;
            });
            this.dom.resetSquareColors();
        }

        return isCheckMate;
    },

    isSoldierInEndSquare() {
        const [column, row] = this.selectedObject.getThisLocation();
        if(column === 0 || column === 7) {
            //If we are with the soldier at the end of the chessBoard
            this.displayPieceTypeOptionMenu(this.selectedObject);
        }
    },

    displayPieceTypeOptionMenu(soldier) {
        this.dom.generatePieceTypeOptionMenu(chessBoard);
        this.pieceTypeOptionMenuDisplayed = true;
        soldier.transformPiece = true;
    },

    hidePieceTypeOptionMenu() {
        this.dom.hidePieceTypeOptionMenu();
        this.pieceTypeOptionMenuDisplayed = false;
    },

    transformSoldier(target, mainMenu) {
        console.log(target);
        const [
            soldierToTransform, soldierLocationSquare, newPieceIcon
        ] = this.dom.transformSoldier(target, this);
        
        if(soldierToTransform && soldierLocationSquare && newPieceIcon) {
            soldierToTransform.transformIcon = false;
            const objectProperties = this.dom.defineObjectProperties(soldierLocationSquare);
            const newPieceObject = this.createNewObject(...objectProperties, newPieceIcon, mainMenu);
            this.piecesArray.push(newPieceObject);

            this.dom.displayCheckStatus(chessBoard);
            this.check = chessBoard.isCheck();
        }
    },

    findObjectFromArray(square, icon) {
        return this.piecesArray.find(piece => {
            if(piece.icon === icon && piece.locationId === square.getAttribute("id"))
                return piece;
        });
    },

    isComputersTurn(mainMenu) {
        if(mainMenu.opponent.type === "computer" && this.turn === mainMenu.opponentSide) {
            return true;
        }

        return false;
    }

};