import { N } from "../constants/constants.js";
import { TicTacToe } from "../TicTacToe.js";

export class Round {
    game;
    firstTurn;

    constructor() {
        this.game = new TicTacToe();
        this.firstTurn = Math.floor(Math.random() * N);
    }

    isOngoing() {
        return !this.game.hasEnded();
    }

    move(move) {
        this.game.placeMove({ from: null, to: move.to });
    }

    hasEnded() {
        return this.game.hasEnded();
    }
}