import { N } from "../constants/constants.js";
import { Player } from "./Player.js";
import { Round } from "./Round.js";

export class Room {
    id;
    rounds;
    players;

    constructor(id, username) {
        this.id = id;
        this.rounds = [];
        const creatingPlayer = new Player(username, 0);
        this.players = [creatingPlayer];
    }

    join(username, socketId) {
        const player = this.players.find(player => player.username === username);

        // Player with username found => check if they are connected
        // If they are not connected, join them
        if (player && !player.isConnected) {
            player.join(socketId);
            return player;
        }

        // Player with username not found or player with username connected
        // Check if Room is full
        if (this.players.length === N) {
            // ROOM FULL ERROR
            throw new Error("ROOM_FULL");
        }

        // If room is not full, then create a new player instance and join
        const joiningPlayer = new Player(username, this.players.length);
        joiningPlayer.join(socketId);
        this.players = [...this.players, joiningPlayer];
        return joiningPlayer;
    }

    contains(socketId) {
        return (this.players.findIndex(player => player.socketId === socketId && player.isConnected === true)) >= 0;
    }

    leave(socketId) {
        const player = this.players.find(player => player.socketId === socketId);
        player.leave();
    }

    isGameOngoing() {
        if (this.rounds.length === 0) {
            return false;
        }

        return ((this.rounds[this.rounds.length - 1]).isOngoing());
    }

    startRound() {
        // Check if all the players are connected 
        if ((this.players.filter(player => player.isConnected)).length < 2) {
            throw new Error("WAITING FOR PLAYERS");
        }

        // Check that a game isnt ongoing already
        if ((this.isGameOngoing())) {
            throw new Error("GAME ALREADY ONGOING");
        }

        // Start a new empty Game instance and responds to the whole room with firstTurn
        const newRound = new Round();
        this.rounds = [...this.rounds, newRound];
    }

    move(move) {
        // Check that a game isnt ongoing already
        if ((!this.isGameOngoing())) {
            throw new Error("GAME NOT STARTED");
        }

        this.getCurrentRound().move(move);

        if (this.getCurrentRound().hasEnded()) {
            if (this.getCurrentRound().game.result.winner === "X") {
                (this.players[this.getCurrentRound().firstTurn]).score++;
            }
            if (this.getCurrentRound().game.result.winner === "O") {
                (this.players[1 - this.getCurrentRound().firstTurn]).score++;
            }
        }
    }

    getCurrentRound() {
        return this.rounds.length > 0 ? this.rounds[this.rounds.length - 1] : null
    }
}