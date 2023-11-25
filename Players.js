"use strict";

class Player {
    #side;
    #type;
    #id;

    constructor(id) {
        this.#id = id;
    }

    get side() {
        return this.#side;
    }

    get type() {
        return this.#type;
    }

    get id() {
        return this.#id;
    }

    set side(side) {
        this.#side = side;
    }

    set type(type) {
        this.#type = type;
    }

    set id(id) {
        this.#id = id;
    }
    
}

class Human extends Player {
    constructor(id, mainMenuObject) {
        super(id);
        this.type = "human";
        this.side = this.id === 1 ? mainMenuObject.playerSide : mainMenuObject.opponentSide;
    }
}

class Computer extends Player {
    constructor(id, mainMenuObject) {
        super(id);
        this.type = "computer"
        this.side = this.id === 1 ? mainMenuObject.playerSide : mainMenuObject.opponentSide;
    }
}