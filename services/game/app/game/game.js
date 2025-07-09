
// NOTE
// socket listeners
// server:
// game:paddle

// client
// game:update
// game:message
// game:init






// 		position += velocity * deltaTime;
import { assert } from 'console';

const PaddleWidth = 10;
const PaddleHeight = 90;
const PaddleSpeed = 600;
const FramesPerSecond = 30;
const BallStartSpeed = 200;
const BallNormalSpeed = 400;
// const BallMaxSpeed = 600;
const finalScore = 5;

const BALL_RADIUS = 10;
const TABLE_HEIGHT = 400;
const TABLE_WIDTH = 600;


class Ball {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.radius = BALL_RADIUS;
		this.speed = BallStartSpeed;
	}

}

// function generateID() {
// 	const timePart = Date.now().toString(36);
// 	const randomPart = Math.random().toString(36).slice(2, 8);
// 	return `${timePart}-${randomPart}`;
// }

function GetPlayerSide() {
	const side = Math.random() < 0.5 ? "left" : "right";
	return side;
}
const MAX_BOUNCE_ANGLE = Math.PI / 3;


class PongGame {
	constructor() {
		this.players = new Map();
		this.ball = new Ball();
		this.ball.y = TABLE_HEIGHT / 2;
		this.ball.x = TABLE_WIDTH / 2;
		this.score = { left: 0, right: 0 };
		this.ball.dx = Math.random() < 0.5 ? 1 : -1;
		this.server = this.ball.dx === 1 ? 'right' : 'left';
		this.right_paddle_event = { up: false, down: false };
		this.left_paddle_event = { up: false, down: false };
		this.paddleHandlers = new Map();
		// this.right_paddle_event = 0;
		// this.left_paddle_event = 0;
		this.firstPlayerSide = undefined;
		this.paddles = {
			left: 150,
			right: 150
		};

	}

	get_players_ids() {
		return [this.players.get('left').id, this.players.get('right').id];
	}

	add_player(socket) {
		console.log(`${socket.user} Joined The Game`);
		if (!this.players.size) {
			this.firstPlayerSide = GetPlayerSide();
			this.players.set(this.firstPlayerSide, { socket, id: socket.user });
			return false;
		}
		else if (this.players.size === 1) {
			this.players.set(this.firstPlayerSide === 'left' ? 'right' : 'left', { socket, id: socket.user }); // TODO add name here !!!
			return true;
		}
	}

	already_joined(uid) {
		const already = [...this.players.values()].some(player => player.socket.user === uid);
		return already;
	}

	broadcast_state() {
		this.players.forEach(player => {
			player.socket.emit('game:update', ({
				...this.paddles, ball: { x: this.ball.x, y: this.ball.y },
				score: { ...this.score }
			}));
		});
	}

	bouncing_paddle(paddleY, isLeft) {
		this.ball.speed = BallNormalSpeed;
		const ball_inter = (this.ball.y - paddleY) / PaddleHeight;
		const norm_inter = (ball_inter * 2) - 1;
		this.ball.dx = -this.ball.dx;
		this.ball.dy = norm_inter * MAX_BOUNCE_ANGLE;
		if (!isLeft)
			this.ball.x = TABLE_WIDTH - (PaddleWidth + BALL_RADIUS + 1);
		else
			this.ball.x = PaddleWidth + BALL_RADIUS + 1;
	}

	// TODO push the ball away from the paddle area 
	update() {
		try {

			const now = Date.now();
			const deltaTime = (now - this.lastTime) / 1000;
			this.lastTime = now;

			['left', 'right'].forEach(side => {
				this.paddles[`${side}`] -= ((PaddleSpeed * deltaTime) * +this[`${side}_paddle_event`].up);
				this.paddles[`${side}`] += ((PaddleSpeed * deltaTime) * +this[`${side}_paddle_event`].down);
				this.paddles[`${side}`] = Math.max(0, Math.min(this.paddles[`${side}`], TABLE_HEIGHT - PaddleHeight));
			})

			if (this.ball.x <= (PaddleWidth + BALL_RADIUS)
				&& (this.ball.y >= this.paddles.left && this.ball.y <= this.paddles.left + PaddleHeight))
				this.bouncing_paddle(this.paddles.left, true);
			// this.ball.dx = -this.ball.dx;

			else if (this.ball.x >= TABLE_WIDTH - (PaddleWidth + BALL_RADIUS)
				&& (this.ball.y >= this.paddles.right && this.ball.y <= this.paddles.right + PaddleHeight))
				this.bouncing_paddle(this.paddles.right);

			else if (this.ball.y <= BALL_RADIUS) {
				this.ball.dy = -this.ball.dy;
				this.ball.y = BALL_RADIUS + 2;
			}

			else if (this.ball.y >= TABLE_HEIGHT - BALL_RADIUS) {
				this.ball.dy = -this.ball.dy;
				this.ball.y = TABLE_HEIGHT - BALL_RADIUS - 2;
			}


			if (this.ball.x > TABLE_WIDTH || this.ball.x < 0) {
				this.score.right += this.ball.x > TABLE_WIDTH;
				this.score.left += this.ball.x < 0;
				this.reset();
				return;
			}

			this.ball.x += (this.ball.dx * (this.ball.speed * deltaTime));
			this.ball.y += (this.ball.dy * (this.ball.speed * deltaTime));

		} catch (error) {
			console.error(error);
		}

	}

	reset() {
		this.ball.y = TABLE_HEIGHT / 2;
		this.ball.x = TABLE_WIDTH / 2;
		this.ball.dy = 0;
		this.ball.dx = this.server === 'left' ? -1 : 1;
		this.server = this.server === 'left' ? 'right' : 'left';
		this.ball.speed = BallStartSpeed;
	}

	async start() {
		try {
			if (this.players.size !== 2) return;

			this.players.forEach((player, key) => {
				console.log("sended to: ", player.socket.user);
				player.socket.emit('game:init', { side: key });
			});

			this.players.forEach(player => {
				player.socket.emit('game:message', "2 Players Joined...");
			});

			// this.paddleHandlers = new Map();

			['left', 'right'].forEach(side => {
				const player = this.players.get(side);

				const handler = (event) => {
					console.log("[EVENT INPUT]", event);
					this[`${side}_paddle_event`] = event;
				};

				this.paddleHandlers.set(side, handler);
				player.socket.on('game:paddle', handler);
			});


			await new Promise((resolve) => {
				let i = 4;

				const intervalId = setInterval(() => {
					this.players.forEach((player, key) => {
						console.log(`[COUNTDOWN] Emitting to ${key}:`, player.socket.id, player.socket.user);
						player.socket.emit('game:message', `${i - 1}`);
					});

					i--;
					if (i === 0) {
						clearInterval(intervalId);
						resolve();
					}
				}, 1000);
			});




			// 	setInterval(() => {
			// 		this.ball.speed += this.ball.speed < BallMaxSpeed;
			// 		// console.log("Ball Speed Now: ", this.ball.speed)
			// 	}, 3000)

			return await new Promise((gameResolve) => {

				this.lastTime ??= Date.now();
				const intervalId = setInterval(() => {
					this.update();
					this.broadcast_state();
					if (this.score.left === finalScore || this.score.right === finalScore) // TODO check for the winner here
					{
						['left', 'right'].forEach(side => {
							const player = this.players.get(side);
							player.socket.emit('game:over', this.score[`${side}`] === finalScore ? "You lose" : "You Win!!");
						});

						['left', 'right'].forEach(side => {
							const player = this.players.get(side);
							const handler = this.paddleHandlers.get(side);
							if (handler)
								player.socket.off('game:paddle', handler);
						});

						console.log("Game Over");
						clearInterval(intervalId);
						const gameResult = {
							winner: `${this.score.left > this.score.right ? this.players.get('right').id : this.players.get('left').id}`,
							score: { [this.players.get('left').id]: this.score.right, [this.players.get('right').id]: this.score.left },
							finishedAt: Date.now()
						}
						gameResolve(gameResult);
					}
				}, 1000 / FramesPerSecond);
			});

		} catch (err) { console.log(err); }
	}
}


// module.exports = Ball;
export default PongGame;
