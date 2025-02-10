import { createServer } from "http";
import { Server } from "socket.io";
import { Pieces, Result, Phases, SuccessCodes } from './constants.js';

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000"
	}
});

var rooms = {};
var socketIdToRoomId = {}

const checkBoard = (roomId) => {
    const board = rooms[roomId].board;
    var winner = null;
    for (var i = 0; i < 3; i++) {
        if (board[i][0] !== -1 && ((board[i][0] % 10) === (board[i][1] % 10)) && (board[i][1] % 10) === (board[i][2] % 10)) {
            winner = board[i][0];
            for (var j = 0; j < 3; j++) {
                board[i][j] += 100;
            }
        }        
        if (board[0][i] !== -1 && (board[0][i] % 10) === (board[1][i] % 10) && (board[1][i] % 10) === (board[2][i] % 10)) {
            winner = board[0][i];
            for (var j = 0; j < 3; j++) {
                board[j][i] += 100;
            }
        }        
    }
    if (board[0][0] !== -1 && (board[0][0] % 10) === (board[1][1] % 10) && (board[2][2] % 10) === (board[1][1] % 10)) {
        winner = board[0][0];
        for (var i = 0; i < 3; i++) {
            board[i][i]+= 100; 
        }
    }
    
    if (board[0][2] !== -1 && (board[0][2] % 10) === (board[1][1] % 10) && (board[2][0] % 10) === (board[1][1] % 10)) {
        winner = board[0][2];
        for (var i = 0; i < 3; i++) {
            board[i][2 - i] += 100; 
        }
    }

    if (winner === null) {
        var cnt = 0;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                cnt += (board[i][j] !== -1);
            }
        }
    
        if (cnt === 9) {
            winner = -1;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    board[i][j] += 10;
                }
            }
        }
    }

    return winner;
}

io.on("connection", (socket) => {
	console.log(`${socket.id} CONNECTED`);
	
    socket.on("create", (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            rooms[roomId] = ({
                id: roomId,
                users: [null, null],
                turn: null,
                firstTurn: 0,
                board: [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ],
                result: null,
                phase: Phases.HASNT_STARTED
            })
        }
        console.log(rooms)
    })
    
    socket.on("join", (roomId, username) => {
        console.log("JOIN")
        const room = rooms[roomId];
        
        if (!room) {
            socket.emit("error", SuccessCodes.ROOM_NOT_FOUND, "ROOM NOT FOUND");
            return;            
        }
        
        if ((room.users.filter(user => user !== null)).length === 2) {
            socket.emit("error", SuccessCodes.ROOM_FULL, "ROOM FULL");
            return;
        }

        socket.join(roomId);
        socketIdToRoomId[socket.id] = roomId;
        if (room.users[0] === null) {
            room.users[0] = {id: socket.id, username};
        } else {
            room.users[1] = {id: socket.id, username};
        }
        io.to(roomId).emit("updateRoom", room);
        console.log(rooms)
    })

    socket.on("start", (roomId) => {
        console.log("START")
        const room = rooms[roomId];
        
        if (!room) {
            socket.emit("error", SuccessCodes.ROOM_NOT_FOUND, "ROOM NOT FOUND");
            return;            
        }

        if ((room.users.filter(user => user !== null)).length < 2) {
            socket.emit("error", SuccessCodes.WAITING_FOR_PLAYER, "WAITING FOR PLAYER");
            return;
        }

        room.turn = 1;
        room.firstTurn = (Math.random() > 0.5) ? 1 : 0;
        room.board = [
                    [-1, -1, -1],
                    [-1, -1, -1],
                    [-1, -1, -1]
                ];
        room.phase = Phases.ON_GOING;

        io.to(roomId).emit("updateRoom", room);
        console.log(rooms);
    })

    socket.on("move", (roomId, i, j) => {
        console.log("MOVE")
        const room = rooms[roomId];
        
        if (!room) {
            socket.emit("error", SuccessCodes.ROOM_NOT_FOUND, "ROOM NOT FOUND");
            return;            
        }

        if (room.turn === (room.users.findIndex(user => (user !== null && user.id === socket.id)) ^ room.firstTurn)) {
            room.board[i][j] = room.turn;
            const res = checkBoard(roomId);
            if (res !== null) {
                room.phase = Phases.ENDED;
                room.result = res;
                io.to(roomId).emit("updateRoom", room);
                return;
            }
            room.turn = (room.turn === 1) ? 0 : 1; 
        } else {
            return;
        }

        io.to(roomId).emit("updateRoom", room);
        console.log(rooms);
    })

    socket.on("disconnect", () => {
        console.log(socket.id + " DISCONNECTED")

        const roomId = socketIdToRoomId[socket.id]; 
        delete socketIdToRoomId[socket.id];
        const room = rooms[roomId];
        
        if (!room) {
            socket.emit("error", SuccessCodes.ROOM_NOT_FOUND, "ROOM NOT FOUND");
            return;            
        }
        
        room.users = room.users.map(user => ((user !== null) && (user.id === socket.id)) ? null : user);
        io.to(roomId).emit("updateRoom", room);
        console.log(rooms);
        console.log(socketIdToRoomId)
    })
});

httpServer.listen(8080, () => {
    console.log("Server connected to port 8080")
});