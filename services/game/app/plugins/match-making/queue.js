
import FP from 'fastify-plugin';

class matchingQueue {
	constructor() {
		this.pool = [];
	}

	add(socket) {
		this.pool.push({ time: Date.now(), socket });
	}

	get2players() {
		if (this.pool.length < 2)
			return null;
		this.pool.sort((a, b) => a.time - b.time);
		const player1 = this.pool.shift();
		const player2 = this.pool.shift();
		return [player1, player2];
	}

	canMatch() {
		return this.pool.length >= 2;
	}

	delete(user) {
		if (!user) return;
		this.pool = this.pool.filter(item => item.socket.user !== user);
	}
}

async function cache_plugin(fastify) {
	try {
		fastify.decorate('queue', new matchingQueue());
		fastify.log.info("match-making system (queue) attached");

	} catch {
		fastify.log.error("failed to connect match-making system (queue)");
	}

}

export default FP(cache_plugin);
