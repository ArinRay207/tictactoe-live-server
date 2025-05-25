/**
 * Player class
 * 
 * Player only exists within a room
 */

export class Player {
    id;
    username;
    socketId;
    isConnected;
    score;

    /**
     * Player instance instantiated with an username
     * 
     * By default, we just say the Player is a part of the room but hasnt joined the room yet
     * Hence, by default, socketId is null and isConnected is false
     * Score, by default, is 0
     * 
     * @param {String} username The username of the Player joining
     */
    constructor(username, id) {
        this.id = id;
        this.username = username;
        this.socketId = null;
        this.isConnected = false;
        this.score = 0;
    }

    /**
     * Player joins the room
     * 
     * Set the socketId to the given socketId and isConnected to true
     * 
     * @param {String} socketId The socketId the user uses to connect to the room
     */
    join(socketId) {
        this.socketId = socketId;
        this.isConnected = true;
    }

    /**
     * Player leaves the room
     * 
     * Set the socketId to null and isConnected to false
     */
    leave() {
        this.socketId = null;
        this.isConnected = false;
    }

    increaseScore() {
        this.score++;
    }
}