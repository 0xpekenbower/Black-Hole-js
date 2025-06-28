

import fastify from 'fastify';
import FastifyCors from '@fastify/cors';
// import FastifyCookie from '@fastify/cookie';
import FastifyJwt from '@fastify/jwt';
import FastifySocketIO from '@ericedouard/fastify-socket.io';

// import path from 'path';

import newCache from './plugins/match-making/queue.js';
import gameRooms from './plugins/rooms-handler/rooms.js';
import dbPlugin from './plugins/data-base/player-state.js';
// import SCHEMA from './schemas.js';


// 'offline', 'lobby', 'queued', 'playing', 'disconnected', 'spectating'

const app = fastify({
	logger:
	{
		transport: {
			target: "@fastify/one-line-logger",
		},
		level: 'debug'
	}
});

const Cors = {
	origin: 'http://localhost:3000',
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

app.register(FastifySocketIO, {
	cors: Cors
});

app.register(FastifyJwt, { secret: "very-super-secret" });


app.register(async function () {

	app.io.use((socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			const { identity } = app.jwt.verify(token);
			socket.user = identity;

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
			console.log("message event ", message);
		});

	});
});


app.post("/login", async (request, reply) => {
	try {
		const { username, password } = request.body;

		console.log("Login attempt with: ", [username, password]);

		password;
		const newUser = await app.UserDataBase.createUser(username);

		const payload = {
			identity: username,
			role: 'user'
		};

		console.log("New user created: ", newUser);

		const jwtToken = app.jwt.sign(payload);
		console.log("Login Token: ", jwtToken);

		return reply
			.code(200)
			.header('Authorization', `Bearer ${jwtToken}`)
			.send({ message: "User Created and Logged In Successfully" });

	} catch (err) {
		return reply.code(400).send({ error: err });
	}
});




(async () => {
	await app.ready();
	await app.UserDataBase.resetUsersState();
	// console.log(app.printRoutes());
	await app.listen({ port: 8004, address: "0.0.0.0" }, (err) => {
		if (err) {
			console.error('Server error:', err);
		}
	});
})()
