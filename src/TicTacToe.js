/**
 * turn: 0 => X's turn, 1 => Y's turn
 */

export class TicTacToe {
    board;
    turn;
    result;
    moves;

    constructor(board) {
        this.turn = 0;
        this.result = {
            winner: null,
            state: new Set()
        };
        this.moves = [];

        if (board) {
            this.board = Array.from(board);
            this.board.forEach((cell) => { if (cell !== '#') this.turn++ })
            this.hasEnded();
            return;
        }

        this.board = ['#', '#', '#', '#', '#', '#', '#', '#', '#'];
    }

    getPiece(turn) {
        if (turn % 2 === 0) return 'X';
        if (turn % 2 === 1) return 'O';
    }

    placeMove({ from, to }) {
        if (this.hasEnded()) {
            throw new Error("GAME_ALREADY_ENDED");
        }

        const { x, y } = to;

        if (x < 0 || x >= 3) {
            throw new Error("INVALID_MOVE");
        }

        if (y < 0 || y >= 3) {
            throw new Error("INVALID_MOVE");
        }

        if (this.board[3 * x + y] !== '#') {
            throw new Error("INVALID_MOVE");
        }

        this.board[3 * x + y] = this.getPiece(this.turn);
        this.turn++;
        this.moves = [...this.moves, to];
        return this.board;
    }

    getPossibleMoves(from) {
        let res = [];
        if (this.hasEnded()) {
            return res;
        }

        this.board.forEach((cell, i) => {
            if (cell === '#') {
                res = [...res, { x: Math.floor(i / 3), y: i % 3 }];
            }
        })
        return res;
    }

    hasEnded() {
        let hasEnded = false;
        // rows
        for (let i = 0; i < 3; i++) {
            if (this.board[3 * i] !== '#' && (this.board[3 * i] === this.board[3 * i + 1]) && (this.board[3 * i] === this.board[3 * i + 2])) {
                this.result.winner = this.board[3 * i];
                this.result.state.add(i);
                hasEnded = true;
            }
        }

        // cols
        for (let i = 0; i < 3; i++) {
            if (this.board[i] !== '#' && (this.board[i] === this.board[i + 3]) && (this.board[i + 3] === this.board[i + 6])) {
                this.result.winner = this.board[3 * i];
                this.result.state.add(3 + i);
                hasEnded = true;
            }
        }

        // diags
        if (this.board[4] !== '#' && ((this.board[0] === this.board[4]) && (this.board[4] === this.board[8]))) {
            this.result.winner = this.board[4];
            this.result.state.add(6);
            hasEnded = true;
        }

        if (this.board[4] !== '#' && ((this.board[2] === this.board[4]) && (this.board[4] === this.board[6]))) {
            this.result.winner = this.board[4];
            this.result.state.add(7);
            hasEnded = true;
        }

        // draw
        if (this.turn === 9) {
            this.result.winner = "DRAW";
            hasEnded = true;
        }

        return hasEnded;
    }

    getResult() {
        this.hasEnded();
        return this.result;
    }

    print() {
        for (let i = 0; i < 3; i++) {
            console.log(this.board[3 * i], '|', this.board[3 * i + 1], '|', this.board[3 * i + 2]);
            console.log('---------');
        }
    }
} 