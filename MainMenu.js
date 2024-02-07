"use strict"

class MainMenu {
    #opponent;
    #opponentSide;
    #player;
    #playerSide;
    #modalWindowDisplayed;

    constructor(chessBoard) {

        //Choose opponent
        const modalWindow = {
            modal: document.querySelector(".modal-window"),
            humanButton: document.getElementById("human-button"),
            computerButton: document.getElementById("computer-button"),
            radioButtonWhite: document.getElementById("white-side-button"),
            radioButtonBlack: document.getElementById("black-side-button"),
            startGameButton: document.querySelector(".start-game-button")
        };

        modalWindow.modal.classList.remove("hidden");
        this.#modalWindowDisplayed = true;
        this.addBlur(true);

        //Initialize chessboard, icons and all Piece objects
        chessBoard.dom.createChessboard();
        chessBoard.dom.addIconsToBoard();
        
        modalWindow.startGameButton.addEventListener("click", this.startGame.bind(this, modalWindow, chessBoard));
    }

    startGame(modalWindow, chessBoard) {
        if((modalWindow.radioButtonWhite.checked || modalWindow.radioButtonBlack.checked) &&
            (modalWindow.humanButton.checked || modalWindow.computerButton.checked)) {
            modalWindow.modal.classList.add("hidden");
            this.#modalWindowDisplayed = false;
            this.defineOpponent(modalWindow);
            const humanPlayer = new Human(1, this);
            const secondPlayer = modalWindow.computerButton.checked ? new Computer(2, this) : new Human(2, this);
            this.#player = humanPlayer;
            this.#opponent = secondPlayer;
            if(chessBoard.isComputersTurn(this)) {
                console.log("Computer's turn");
            }
            this.addBlur(false);
            chessBoard.initPieceObjects(this);
        }
    }

    defineOpponent(modalWindow) {
        if(modalWindow.computerButton.checked) {
            this.#opponent = "computer"
        }
        if(modalWindow.humanButton.checked) {
            this.#opponent = "human";
        }

        this.#player = "human";

        if(modalWindow.radioButtonWhite.checked) {
            this.#opponentSide = "black";
            this.#playerSide = "white";
        }

        if(modalWindow.radioButtonBlack.checked) {
            this.#opponentSide = "white";
            this.#playerSide = "black";
        }
    }

    addBlur(add) {
        if(add) {
            document.querySelector(".header").classList.add("blur");
            document.querySelector(".chessboard-container").classList.add("blur");
        } else {
            document.querySelector(".header").classList.remove("blur");
            document.querySelector(".chessboard-container").classList.remove("blur");
        }
        
    }

    get opponentSide() {
        return this.#opponentSide;
    }

    get playerSide() {
        return this.#playerSide;
    }

    get opponent() {
        return this.#opponent;
    }

    get player() {
        return this.#player;
    }

    get modalWindowDisplayed() {
        return this.#modalWindowDisplayed;
    }

    set opponentSide(opponentSide) {
        this.#opponentSide = opponentSide;
    }

    set playerSide(playerSide) {
        this.#playerSide = playerSide;
    }

    set opponent(opponent) {
        this.#opponent = opponent;
    }

    set player(player) {
        this.#player = player;
    }

    set modalWindowDisplayed(modalWindowDisplayed) {
        this.#modalWindowDisplayed = modalWindowDisplayed;
    }
}
