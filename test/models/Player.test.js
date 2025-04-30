import { Player } from "../../src/models/Player";

test('Initiate Player', () => {
    const player = new Player("abc");
    expect(player.username).toBe("abc");
    expect(player.isConnected).toBe(false);
    expect(player.socketId).toBe(null);
    expect(player.score).toBe(0);
})

test('Player joins using socketId', () => {
    const player = new Player("abc");
    player.join("sId");
    expect(player.username).toBe("abc");
    expect(player.isConnected).toBe(true);
    expect(player.socketId).toBe("sId");
    expect(player.score).toBe(0);
})

test('Player leaves', () => {
    const player = new Player("abc");
    player.join("sId");
    player.leave();
    expect(player.username).toBe("abc");
    expect(player.isConnected).toBe(false);
    expect(player.socketId).toBe(null);
    expect(player.score).toBe(0);
})