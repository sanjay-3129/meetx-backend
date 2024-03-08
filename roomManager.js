// roomManager.js
const { v4: uuidv4 } = require('uuid');

class RoomManager {
    constructor(baseURL) {
        this.rooms = new Map();
        this.baseURL = baseURL;
    }

    createRoom() {
        const roomId = uuidv4();
        const roomUrl = `${this.baseURL}/rooms/${roomId}`;
        this.rooms.set(roomId, { roomId, roomUrl });
        return { roomId, roomUrl };
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
}

module.exports = RoomManager;
