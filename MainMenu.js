"use strict"

//Choose opponent
const modalWindow = {
    modal: document.querySelector(".modal-window"),
    humanButton: document.getElementById("human-button"),
    computerButton: document.getElementById("computer-button"),
    isDisplayed: false,
    radioButtonWhite: document.getElementById("side_white"),
    radioButtonBlack: document.getElementById("side_black"),
    okButton: document.querySelector(".ok-button")
};

class MainMenu {
    #opponent;
    #opponentSide;
    #player;
    #playerSide;

    constructor(modalWindow) {
        modalWindow.modal.classList.remove("hidden");
        modalWindow.isDisplayed = true;
        console.log(modalWindow);
        this.addBlur(true);
        
        modalWindow.okButton.addEventListener("click", this.startGame.bind(this, modalWindow));
    }

    startGame(modalWindow) {
        if((modalWindow.radioButtonWhite.checked || modalWindow.radioButtonBlack.checked) &&
            (modalWindow.humanButton.checked || modalWindow.computerButton.checked)) {
            modalWindow.modal.classList.add("hidden");
            modalWindow.isDisplayed = false;
            this.defineOpponent(modalWindow);
            const humanPlayer = new Human(1, this);
            const secondPlayer = modalWindow.computerButton.checked ? new Computer(2, this) : new Human(2, this);
            this.#player = humanPlayer;
            this.#opponent = secondPlayer;
            if(chessBoard.isComputersTurn(mainMenu)) {
                console.log("Computer's turn");
            }
            this.addBlur(false);
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
}