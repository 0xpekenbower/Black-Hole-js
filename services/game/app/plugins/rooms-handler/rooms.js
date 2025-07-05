

import FP from 'fastify-plugin';
import PongGame from '../../game/game.js';



class RoomsManager {
	constructor(fastify) {
		this.curRooms = new Map();
		this.playingRooms = [];
		// this.occupiedRooms = [];
		this.app = fastify;
	}

	genRoom() {
		const timePart = Date.now().toString(36);
		const randomPart = Math.random().toString(36).slice(2, 8);
		const roomId = `${timePart}-${randomPart}`;


		this.curRooms.set(roomId, new PongGame());
		console.log("Room Id:", roomId);
		return roomId;
	}

	joinRoom(roomId, socket) {
		const Room = this.curRooms.get(roomId);
		if (!Room)
			return;
		if (Room.add_player(socket)) {
			console.log("rOOm is Playing");
			this.playingRooms.push(Room);
			this.curRooms.delete(roomId);
			const [id1, id2] = Room.get_players_ids();
			console.log("Users from game: ", id1, id2);
			Room.start().then(async (data) => {
				console.log("Game Over: ", data)
				await this.app.UserDataBase.updateState(id1, 'lobby');
				await this.app.UserDataBase.updateState(id2, 'lobby');

				this.app.UserDataBase.createHistory({ player_id: id1, rival_id: id2, winner_id: data.winner })
				this.app.UserDataBase.createHistory({ player_id: id2, rival_id: id1, winner_id: data.winner })

			});
		}

	}
	roomExist(roomId) {
		return (this.curRooms.get(roomId) !== undefined);
	}

	already_joined(roomId, uid) {
		const already = this.curRooms.get(roomId).already_joined(uid);
		console.log("state in room", already);
		return (already);
	}
}

export default FP(async (fastify) => {
	try {
		const roomManager = new RoomsManager(fastify);
		fastify.decorate('roomManager', roomManager);
		fastify.log.info("game-rooms manager attached");
	} catch {
		fastify.log.error("failed to connect (game-rooms manager)");
	}
});
