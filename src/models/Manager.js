import { eventTypes } from "../constants/eventTypes.js";
import { Room } from "./Room.js";
import ShortUniqueId from 'short-unique-id';

export class Manager {
    rooms = [];
    sockets = {};

    constructor() {
        this.rooms = [];
    }

    #createRandomRoomId() {
        try {
            const { randomUUID } = new ShortUniqueId({ length: 10 });
            var roomId;
            do {
                roomId = randomUUID();
            } while (this.rooms.find(room => room.id === roomId));
            return roomId;
        } catch (error) {
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error.message } }));
        }
    }

    addListeners(socket) {
        try {
            socket.on('error', console.error);
            this.sockets[socket.id] = socket;

            socket.on('message', (data) => {
                const message = JSON.parse(data.toString());
                console.log(message)
                const { type, payload } = message;
                switch (type) {
                    case eventTypes.CREATE: this.createRoom(payload.username, socket); break;
                    case eventTypes.JOIN: this.joinRoom(payload.username, payload.roomId, socket); break;
                    case eventTypes.DISCONNECT: this.leaveRoom(socket); break;
                    case eventTypes.MOVE: this.move(payload.roomId, payload.move, socket); break;

                    case eventTypes.START: this.start(payload.roomId, socket); break;
                }
                console.log(JSON.stringify(this.rooms, null, 2));
            })

            socket.on('close', () => { this.leaveRoom(socket) })
        } catch (error) {
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error.message } }));
        }
    }

    createRoom(username, socket) {
        try {
            // Create random Unique roomID
            const roomId = this.#createRandomRoomId();

            // Create an empty room with the roomId
            const room = new Room(roomId, username);
            this.rooms = [...this.rooms, room];

            socket.send(JSON.stringify({ payload: { roomId }, type: eventTypes.CREATE }));
        } catch (error) {
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error.message } }));
        }
    }

    joinRoom(username, roomId, socket) {
        try {
            const socketId = socket.id;

            // Check if room exists 
            const room = this.rooms.find(room => room.id === roomId);

            if (!room) {
                socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: "ROOM NOT FOUND" } }));
                return;
            }

            const player = room.join(username, socketId);

            room.players.forEach((player) => {
                if (player.isConnected) {
                    (this.sockets[player.socketId]).send(JSON.stringify({ payload: { room: { id: room.id, players: room.players }, round: room.getCurrentRound(), player: player }, type: eventTypes.UPDATE_ROOM }));
                }
            })

        } catch (error) {
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error.message } }));
        }
    }

    leaveRoom(socket) {
        try {
            const socketId = socket.id;

            // A function in room to check if socketId is part of the room
            const room = this.rooms.find(room => room.contains(socketId));

            if (!room) {
                // Socket not part of any room
                return;
            }

            room.leave(socketId);
            delete this.sockets[socketId];

            room.players.forEach((player) => {
                if (player.isConnected) {
                    (this.sockets[player.socketId]).send(JSON.stringify({ payload: { room: { id: room.id, players: room.players } }, type: eventTypes.UPDATE_ROOM }));
                }
            })

        } catch (error) {
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error } }));
        }
    }

    start(roomId, socket) {
        try {
            const room = this.rooms.find(room => room.id === roomId);

            // Check if the roomID exists
            if (!room) {
                throw new Error("ROOM NOT FOUND");
            }

            room.startRound();


            room.players.forEach((player) => {
                if (player.isConnected) {
                    (this.sockets[player.socketId]).send(JSON.stringify({ payload: { firstTurn: room.getCurrentRound().firstTurn, game: room.getCurrentRound().game }, type: eventTypes.START }));
                }
            })
        } catch (error) {
            console.error(error);
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error.message } }));
        }
    }

    move(roomId, move, socket) {
        try {
            const room = this.rooms.find(room => room.id === roomId);

            // Check if the roomID exists
            if (!room) {
                throw new Error("ROOM NOT FOUND");
            }

            room.move(move);


            room.players.forEach((player) => {
                if (player.isConnected) {
                    (this.sockets[player.socketId]).send(JSON.stringify({ payload: { game: room.getCurrentRound().game }, type: eventTypes.MOVE }));
                }
            })

            if (!room.isGameOngoing()) {
                room.players.forEach((player) => {
                    if (player.isConnected) {
                        (this.sockets[player.socketId]).send(JSON.stringify({
                            payload: { room: { id: room.id, players: room.players } }, type: eventTypes.UPDATE_ROOM
                        }));
                    }
                })
            }
        } catch (error) {
            console.error(error);
            socket.send(JSON.stringify({ type: eventTypes.ERROR, payload: { message: error.message } }));
        }
    }
}