import { Room } from './../../src/models/Room';
import { Player } from '../../src/models/Player';

jest.mock("../../src/models/Player");

beforeEach(() => { Player.mockClear(); })

test("Room initiated", () => {
    const room = new Room("id", "abc");
    expect(room.id).toBe("id");
    expect(room.games).toEqual([]);
    expect(room.players.length).toBe(1);
    expect(Player).toHaveBeenCalledTimes(1);
    expect(Player).toBeCalledWith("abc");
})

test("Person already in room joins", () => {
    const room = new Room("id", "abc");
    const mockPlayerInstance = Player.mock.instances[0];

    Array.prototype.find = jest.fn(() => mockPlayerInstance);

    room.join("abc", "sId");

    expect(room.players.length).toBe(1);
    const mockJoin = mockPlayerInstance.join;

    expect(mockJoin).toHaveBeenCalledTimes(1);
    expect(mockJoin).toBeCalledWith("sId");
})

test("New person joins", () => {
    const room = new Room("id", "abc");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    expect(Player).toHaveBeenCalledTimes(2);
    expect(Player).toHaveBeenCalledWith("abc");
    expect(Player).toHaveBeenCalledWith("xyz");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    const mockSecondPlayerInstance = Player.mock.instances[1];

    expect(mockFirstPlayerInstance.join).toHaveBeenCalledTimes(0);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledWith("socketId");
})

test("Person tries to join in a full room", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    expect(() => room.join("aaa", "socketId")).toThrow("ROOM_FULL");
    expect(room.players.length).toBe(2);

    expect(Player).toHaveBeenCalledTimes(2);
    expect(Player).toHaveBeenCalledWith("abc");
    expect(Player).toHaveBeenCalledWith("xyz");
    const mockSecondPlayerInstance = Player.mock.instances[1];

    expect(mockFirstPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledWith("socketId");
})


test("Person tries to join in a full room with same name as existing person", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    expect(() => room.join("abc", "socketId")).toThrow("ROOM_FULL");
    expect(room.players.length).toBe(2);

    expect(Player).toHaveBeenCalledTimes(2);
    expect(Player).toHaveBeenCalledWith("abc");
    expect(Player).toHaveBeenCalledWith("xyz");
    const mockSecondPlayerInstance = Player.mock.instances[1];

    expect(mockFirstPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledWith("socketId");
})

test("First Person leaves", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    const mockSecondPlayerInstance = Player.mock.instances[1];

    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.leave("sId");

    expect(mockFirstPlayerInstance.leave).toHaveBeenCalledTimes(1);
    expect(mockFirstPlayerInstance.leave).toHaveBeenCalledWith();

    expect(mockSecondPlayerInstance.leave).toHaveBeenCalledTimes(0);
})

test("Second Person leaves", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    const mockSecondPlayerInstance = Player.mock.instances[1];
    Array.prototype.find = jest.fn(() => mockSecondPlayerInstance);
    room.leave("sId");

    expect(mockFirstPlayerInstance.leave).toHaveBeenCalledTimes(0);

    expect(mockSecondPlayerInstance.leave).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.leave).toHaveBeenCalledWith();
})

test("Both leave", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    const mockSecondPlayerInstance = Player.mock.instances[1];
    Array.prototype.find = jest.fn(() => mockSecondPlayerInstance);
    room.leave("sId");
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.leave("xyz");

    expect(mockFirstPlayerInstance.leave).toHaveBeenCalledTimes(1);
    expect(mockFirstPlayerInstance.leave).toHaveBeenCalledWith();

    expect(mockSecondPlayerInstance.leave).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.leave).toHaveBeenCalledWith();
})

test("First Player rejoins", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");
    const mockSecondPlayerInstance = Player.mock.instances[1];

    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.leave("sId");

    expect(() => room.join("abc", "socketId2")).not.toThrow("ROOM_FULL");

    expect(Player).toHaveBeenCalledTimes(2);
    expect(mockFirstPlayerInstance.join).toHaveBeenCalledTimes(2);
    expect(mockFirstPlayerInstance.join).toHaveBeenCalledWith("sId");
    expect(mockFirstPlayerInstance.join).toHaveBeenCalledWith("socketId2");
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledWith("socketId");
})


test("First Player leaves, same name as Second Player tries to join", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");
    const mockSecondPlayerInstance = Player.mock.instances[1];

    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.leave("sId");

    Array.prototype.find = jest.fn(() => ({ ...mockSecondPlayerInstance, isConnected: true }));
    expect(() => room.join("xyz", "socketId2")).toThrow("ROOM_FULL");

    expect(Player).toHaveBeenCalledTimes(2);
    expect(mockFirstPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockFirstPlayerInstance.join).toHaveBeenCalledWith("sId");
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledTimes(1);
    expect(mockSecondPlayerInstance.join).toHaveBeenCalledWith("socketId");
})


test("Both leave, third person tries to join", () => {
    const room = new Room("id", "abc");
    const mockFirstPlayerInstance = Player.mock.instances[0];
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.join("abc", "sId");

    Array.prototype.find = jest.fn(() => undefined);
    room.join("xyz", "socketId");

    const mockSecondPlayerInstance = Player.mock.instances[1];
    Array.prototype.find = jest.fn(() => mockSecondPlayerInstance);
    room.leave("sId");
    Array.prototype.find = jest.fn(() => mockFirstPlayerInstance);
    room.leave("xyz");

    Array.prototype.find = jest.fn(() => undefined);
    expect(() => { room.join("ada"); }).toThrow("ROOM_FULL");

})

test("contains", () => {
    const room = new Room("id", "abc");
    Array.prototype.findIndex = jest.fn(() => -1);
    expect(room.contains("sid")).toBe(false);
})

test("contains", () => {
    const room = new Room("id", "abc");
    Array.prototype.findIndex = jest.fn(() => 1);
    expect(room.contains("sid")).toBe(true);
})