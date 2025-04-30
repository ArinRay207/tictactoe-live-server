import { Manager } from "../../src/models/Manager";
import { Room } from "../../src/models/Room";

jest.mock("../../src/models/Room");

beforeEach(() => { Room.mockClear(); })

test('Manager initialied with no rooms', () => {
    const manager = new Manager();
    expect(manager.rooms).toEqual([]);
})

test('Room created', () => {
    const manager = new Manager();
    const roomId = manager.createRoom("abc");
    expect(manager.rooms.length).toBe(1);
    // expect(manager.rooms[0].id).toBe(roomId);
})

test('Room created sucessfully with one person', () => {
    const manager = new Manager();
    manager.createRoom("abc");
    expect(Room).toHaveBeenCalledTimes(1);
})

test('Multiple rooms created', () => {
    const manager = new Manager();
    const iterations = 3;
    for (var i = 0; i < iterations; i++) {
        manager.createRoom("abc");
    }
    expect(manager.rooms.length).toBe(iterations);
    expect(Room).toHaveBeenCalledTimes(iterations);
})

test('Person with username and socketId joins room with id roomId', () => {
    const username = "a";
    const socketId = "sid";

    const manager = new Manager();
    const roomId = manager.createRoom("abc");

    expect(Room).toHaveBeenCalledTimes(1);
    expect(Room).toHaveBeenCalledWith(roomId, "abc");

    const mockRoomInstance = Room.mock.instances[0];
    const mockJoin = mockRoomInstance.join;

    Array.prototype.find = jest.fn(() => ({ ...mockRoomInstance, id: roomId }))
    manager.joinRoom(username, roomId, { id: socketId });
    expect(mockJoin).toHaveBeenCalledTimes(1);
    expect(mockJoin).toHaveBeenCalledWith(username, socketId);
})