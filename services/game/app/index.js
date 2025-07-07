

import fastify from 'fastify';
import FastifyCors from '@fastify/cors';
// import FastifyCookie from '@fastify/cookie';
import FastifyJwt from '@fastify/jwt';
import FastifySocketIO from '@ericedouard/fastify-socket.io';

// import path from 'path';

import newCache from './plugins/match-making/queue.js';
import gameRooms from './plugins/rooms-handler/rooms.js';
import dbPlugin from './plugins/data-base/player-state.js';
import kafkaProducerPlugin from './plugins/kafka-client/producer.js';
import kafkaConsumerPlugin from './plugins/kafka-client/consumer.js';
import { decode } from 'punycode';
// import SCHEMA from './schemas.js';


// 'offline', 'lobby', 'queued', 'playing', 'disconnected', 'spectating'

const app = fastify({
	// logger:
	// {

	// 	// transport: {
	// 	// 	target: "@fastify/one-line-logger",
	// 	// },
	// 	level: 'debug'
	// }
	logger: {
		level: process.env.LOG_LEVEL || 'info',
		ignore: 'pid,hostname,reqId',
		formatters: {
			level: (label) => ({ level: label }),
			bindings: () => ({})
		},
		base: undefined,
		timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
		hostname: false
	}
});

const Cors = {
	origin: ['http://frontend:3000', 'http://nginx:80', "https://blackholejs.art"], // FIXME change cors !!!
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'OPTIONS'],
	exposedHeaders: ['Authorization'],
}

app.register(FastifyCors, Cors);

// app.register(FastifyCookie);
app.register(newCache);
app.register(gameRooms);
app.register(dbPlugin);
app.register(kafkaProducerPlugin)
app.register(kafkaConsumerPlugin);

app.register(FastifySocketIO, {
	cors: Cors,
	transports: ['websocket']
});

app.register(FastifyJwt, { secret: process.env.JWT_SECRET });


app.register(async function () {

	app.io.use((socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			console.log(token);
			const { id } = app.jwt.verify(token);
			socket.user = id;

			next();
		} catch {
			// console.log(error);
			return next(new Error('Authorization error'));
		}
	});

	// const invitations = new Map();

	app.io.on('connection', async (socket) => {


		const newUserState = await app.UserDataBase.getState(socket.user);
		if (newUserState !== 'offline') {
			console.log("[CONNECTION REFUSED user: ", socket.user, "state: ", newUserState, " ]");
			socket.disconnect(true);
			return;
		}

		await app.UserDataBase.updateState(socket.user, "lobby");

		console.log(`New Connection From: ${socket.user}`);
		socket.emit('welcome', `welcome to pong game: ${socket.user}`);



		socket.on('queue:join', async () => {
			try {
				if (await app.UserDataBase.getState(socket.user) !== 'lobby') {
					console.log(socket.user, " Refused from queu");
					return socket.emit('queue:error', "Bad state to queue");
				}

				app.queue.add(socket);
				await app.UserDataBase.updateState(socket.user, 'queued')

				socket.emit('queue:joined', "you joined a queue");
				console.log(socket.user, " Joined a queue");
				if (app.queue.canMatch()) {
					const roomId = app.roomManager.genRoom();


					const players = app.queue.get2players();
					players[0].socket.emit('room:id', { roomid: roomId });
					// await app.UserDataBase.updateState(players[0].socket.user, 'playing')
					players[1].socket.emit('room:id', { roomid: roomId });
					// await app.UserDataBase.updateState(players[1].socket.user, 'playing')
				}
			} catch (err) {
				console.log("error --> ", err);
				// socket.emit(JSON.stringify({ error: "Invalid event message" }));
				// socket.close();
			}
		});


		socket.on('queue:cancel', async () => {
			try {
				if (await app.UserDataBase.getState(socket.user) !== 'queued')
					return socket.emit('queue:error', "Bad state to cancel queue");


				app.queue.delete(socket.user);
				await app.UserDataBase.updateState(socket.user, 'lobby');
				// app.UserDataBase.getState(socket.user)

				socket.emit('queue:canceled', "");
				console.log("Queue Canceld");


			} catch (err) {
				console.log("error --> ", err);
				// socket.emit(JSON.stringify({ error: "Invalid event message" }));
				// socket.close();
			}
		});

		socket.on('room:join', (event) => {
			try {
				const roomId = event.roomid;

				if (!app.roomManager.roomExist(roomId)) {
					socket.emit('room:error', "Room Not Playable: !!TODO reason");
					return;
				}

				if (!app.roomManager.already_joined(roomId, socket.user)) {
					app.roomManager.joinRoom(roomId, socket);
					socket.emit('room:joined', "Room Joined");
				}
			} catch (err) {
				console.log(err);
			}
		});

		// TODO check the queue, mybe  wait 
		// TODO clear events -> remove from queue 
		socket.on('disconnect', async (reason) => {
			console.log("[CLIENT DISCONNECTED]: ", socket.user, "[CAUSE]: ", reason);
			await app.UserDataBase.updateState(socket.user, 'offline');
			app.queue.delete(socket.user);
		});

		socket.on('message', (message) => {
			console.log("message event ", message); ``
		});

	});
});


app.get("/api/game/history", async (request, reply) => { // TODO return data based on use history 
	try {

		const data = await app.UserDataBase.getHistory(3);
		console.log(data);

		// const decoded = app.jwt.verify();


		// console.log(`user: ${decoded.id} Requestd get history`);
		return reply.send(data);
	} catch (err) {
		return reply.code(401).send(err);
	}
});



app.post("/ping", async (request, reply) => {
	console.log("ping");
});



(async () => {
	await app.ready();
	await app.UserDataBase.resetUsersState();
	// console.log(app.printRoutes());
	await app.listen({ port: 8004, host: "0.0.0.0" }, (err) => {
		if (err) {
			console.error('Server error:', err);
		}
	});
})()
