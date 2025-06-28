"use client"

import { useEffect, useRef, useContext, useState } from "react"
import { GameSocketContext } from "@/components/io";
import { useView } from './view'
import { Button } from "@/components/ui/card";

interface Score {
	left: number,
	right: number
}

type ScalableOp = {
	BallRadius: number,
	PaddleWidth: number,
	PaddleHeight: number
}

type GameState = {
	LeftX: number,
	RightX: number,
	LeftY: number,
	RightY: number,
	BallX: number,
	BallY: number,
	Score: Score
}

const LOGICAL_WIDTH = 600;
const LOGICAL_HEIGHT = 400;
const scalableGameOptions: ScalableOp = {
	BallRadius: 10,
	PaddleWidth: 10,
	PaddleHeight: 90
};



export default function Game() {
	const socket = useContext(GameSocketContext);
	const sideOnServerRef = useRef<"left" | "right" | "">("");
	const [isGameOver, setIsGameOver] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const { setView } = useView();
	const scaleX = useRef(1);
	const scaleY = useRef(1);

	const gameStateRef = useRef<GameState>({
		LeftX: 1,
		RightX: 589,
		LeftY: 150,
		RightY: 150,
		BallX: LOGICAL_WIDTH / 2,
		BallY: LOGICAL_HEIGHT / 2,
		Score: { left: 0, right: 0 }
	});

	const inputState = {
		up: false,
		down: false,
	};

	function displayMessage(text: string, fontSize = 30, clear = false) {

		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!canvas || !ctx) return;

		if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.font = `${fontSize}px 'Press Start 2P'`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	}

	function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, "#000000");
		gradient.addColorStop(0.5, "#111111");
		gradient.addColorStop(1, "#000000");

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.setLineDash([10, 10]);
		ctx.strokeStyle = "#00ffff";
		ctx.lineWidth = 2;

		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 10;

		ctx.beginPath();
		ctx.moveTo(canvas.width / 2, 0);
		ctx.lineTo(canvas.width / 2, canvas.height);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.shadowBlur = 0;

	}


	function drawBall(sx: number, sy: number) {
		const ctx = ctxRef.current;
		const options = scalableGameOptions;
		const state = gameStateRef.current;
		if (!ctx) return;

		const x = state.BallX * sx;
		const y = state.BallY * sy;
		const radius = options.BallRadius * Math.min(sx, sy);

		const gradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
		gradient.addColorStop(0, "#ffffff");
		gradient.addColorStop(1, "#00ffff");

		ctx.fillStyle = gradient;
		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0; // Reset
	}


	function drawPaddles(sx: number, sy: number, side: string) {

		const ctx = ctxRef.current;
		const state = gameStateRef.current;
		const options = scalableGameOptions;
		if (!ctx) return;

		const paddles = [
			{
				x: state.LeftX * sx,
				y: state.LeftY * sy,
				color: side === "left" ? "#ff5555" : "white"
			},
			{
				x: state.RightX * sx,
				y: state.RightY * sy,
				color: side === "right" ? "#ff5555" : "white"
			}
		];

		for (const p of paddles) {
			ctx.fillStyle = p.color;
			const width = options.PaddleWidth * sx;
			const height = options.PaddleHeight * sy;
			const radius = 6;

			ctx.beginPath();
			ctx.moveTo(p.x + radius, p.y);
			ctx.lineTo(p.x + width - radius, p.y);
			ctx.quadraticCurveTo(p.x + width, p.y, p.x + width, p.y + radius);
			ctx.lineTo(p.x + width, p.y + height - radius);
			ctx.quadraticCurveTo(p.x + width, p.y + height, p.x + width - radius, p.y + height);
			ctx.lineTo(p.x + radius, p.y + height);
			ctx.quadraticCurveTo(p.x, p.y + height, p.x, p.y + height - radius);
			ctx.lineTo(p.x, p.y + radius);
			ctx.quadraticCurveTo(p.x, p.y, p.x + radius, p.y);
			ctx.fill();
		}
	}


	function drawScores(state: GameState) {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		const side = sideOnServerRef.current;
		if (!ctx || !canvas) return;

		const percentX = (p: number) => (p / 100) * canvas.width;
		const percentY = (p: number) => (p / 100) * canvas.height;

		ctx.font = `bold 36px 'Press Start 2P'`;
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "black";
		ctx.shadowBlur = 8;

		ctx.fillText(state.Score.left.toString(), percentX(side === 'left' ? 40 : 60), percentY(10));
		ctx.fillText(state.Score.right.toString(), percentX(side === 'left' ? 60 : 40), percentY(10));

		ctx.shadowBlur = 0;

	}
	// else {
	// 	ctx.fillText(state.Score.left.toString(), percentX(60), percentY(10));
	// 	ctx.fillText(state.Score.right.toString(), percentX(40), percentY(10));
	// }


	function render() {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (sideOnServerRef.current === "left") {
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
		}

		drawBackground(ctx, canvas);
		drawBall(scaleX.current, scaleY.current);
		drawPaddles(scaleX.current, scaleY.current, sideOnServerRef.current);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		drawScores(gameStateRef.current);

	}

	const resizeCanvas = () => {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;

		const aspectRatio = 3 / 2;
		let width = window.innerWidth * 0.9;
		let height = width / aspectRatio;

		if (height > window.innerHeight * 0.8) {
			height = window.innerHeight * 0.8;
			width = height * aspectRatio;
		}

		canvas.width = width;
		canvas.height = height;
		scaleX.current = width / LOGICAL_WIDTH;
		scaleY.current = height / LOGICAL_HEIGHT;

		ctx.clearRect(0, 0, width, height);
	};


	// --- Input handlers ---
	const sendInput = () => {
		socket?.emit("game:paddle", inputState);
	};

	const keyDownEvent = (e: KeyboardEvent) => {
		if (e.key === "ArrowUp") inputState.up = true;
		if (e.key === "ArrowDown") inputState.down = true;
		sendInput();
	};

	const keyUpEvent = (e: KeyboardEvent) => {
		if (e.key === "ArrowUp") inputState.up = false;
		if (e.key === "ArrowDown") inputState.down = false;
		sendInput();
	};


	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctxRef.current = ctx;

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);
		window.addEventListener("keydown", keyDownEvent);
		window.addEventListener("keyup", keyUpEvent);

		// Socket Events
		socket?.on("game:message", (event) => {
			console.log("[FRONT GOT MESSAGE]:", event);
			displayMessage(event.message, 30, true);
		});

		socket?.on("game:result", (event) => {
			console.log("[FRONT GOT RESULT]:", event);
			displayMessage(event.message);
		});

		socket?.on("game:update", (event) => {
			const state = gameStateRef.current;
			state.BallX = event.ball.x;
			state.BallY = event.ball.y;
			state.LeftY = event.left;
			state.RightY = event.right;
			state.Score.left = event.score.left;
			state.Score.right = event.score.right;

			render();
		});

		socket?.on("game:init", (event) => {

			sideOnServerRef.current = event.side;
			console.log("You are:", event.side);
		});

		socket?.on("game:over", (event) => {
			displayMessage("Game Over!!\nYou [eee]", 30, true);
			setIsGameOver(true);
		});

		socket?.emit("room:join", { roomid: sessionStorage.getItem("roomId") });

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			window.removeEventListener("keydown", keyDownEvent);
			window.removeEventListener("keyup", keyUpEvent);
		};
	}, []);

	// TODO disable slided bar until game is done 
	// TODO display result (win)

	return (
		<div className="relative w-full flex justify-center">
			<canvas
				ref={canvasRef}
				className="bg-black block mx-auto rounded-lg shadow-lg"
			/>

			{isGameOver && (
				<Button
					onClick={() => setView("menu")}
					className="absolute top-1/2 translate-y-20 px-6 py-2  bg-emerald-700 hover:bg-emerald-800
					 text-white font-press-start rounded"
				>
					Lobby
				</Button>
			)}
		</div>

	);
}
