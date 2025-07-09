
"use client"

import { useEffect, useRef, useContext, useState } from "react";
import { GameSocketContext } from "@/components/io";
import { useView } from './view';
import { Button } from "@/components/ui/card";
import LayoutContext from '@/context/BarContext'



interface Score {
	left: number,
	right: number
}

type ScalableOp = {
	BallRadius: number,
	PaddleWidth: number,
	PaddleHeight: number
};

type GameState = {
	LeftX: number,
	RightX: number,
	LeftY: number,
	RightY: number,
	BallX: number,
	BallY: number,
	Score: Score
};

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
	const { setShowSidebar } = useContext(LayoutContext);
	const { setView } = useView();
	const scaleX = useRef(1);
	const scaleY = useRef(1);

	const currentState = useRef<GameState>({
		LeftX: 1,
		RightX: 589,
		LeftY: 150,
		RightY: 150,
		BallX: LOGICAL_WIDTH / 2,
		BallY: LOGICAL_HEIGHT / 2,
		Score: { left: 0, right: 0 }
	});

	const previousState = useRef<GameState | null>(null);
	const lastUpdateTime = useRef<number>(performance.now());
	const [hasStarted, setHasStarted] = useState(false);

	const inputState = { up: false, down: false };

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

	function drawBallInterpolated(x: number, y: number) {
		const ctx = ctxRef.current;
		if (!ctx) return;
		const sx = scaleX.current;
		const sy = scaleY.current;
		const radius = scalableGameOptions.BallRadius * Math.min(sx, sy);
		const drawX = x * sx;
		const drawY = y * sy;
		const gradient = ctx.createRadialGradient(drawX, drawY, radius * 0.2, drawX, drawY, radius);
		gradient.addColorStop(0, "#ffffff");
		gradient.addColorStop(1, "#00ffff");
		ctx.fillStyle = gradient;
		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;
	}

	function drawPaddles(sx: number, sy: number, side: string, leftY: number, rightY: number) {
		const ctx = ctxRef.current;
		const state = currentState.current;
		const options = scalableGameOptions;
		if (!ctx) return;

		const paddles = [
			{ x: state.LeftX * sx, y: leftY * sy, color: side === "left" ? "#ff5555" : "white" },
			{ x: state.RightX * sx, y: rightY * sy, color: side === "right" ? "#ff5555" : "white" },
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

	function drawScores() {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!ctx || !canvas) return;
		const state = currentState.current;
		const side = sideOnServerRef.current;
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

	function drawFrame(BallX: number, BallY: number, leftY: number, rightY: number) {
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
		drawBallInterpolated(BallX, BallY);
		drawPaddles(scaleX.current, scaleY.current, sideOnServerRef.current, leftY, rightY);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		drawScores();
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

	const sendInput = () => socket?.emit("game:paddle", inputState);
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

		socket?.on("game:message", (message) => {
			displayMessage(message, 30, true);
		});
		socket?.on("game:result", (event) => displayMessage(event.message));
		socket?.on("game:init", (event) => {
			sideOnServerRef.current = event.side;
			console.log("You are:", event.side);
		});
		socket?.on("game:over", (result) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground(ctx, canvas);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			drawScores();
			displayMessage(`Game Over ${result}`, 30, false);
			setIsGameOver(true);
		});

		socket?.on("game:update", (event) => {
			previousState.current = { ...currentState.current };
			lastUpdateTime.current = performance.now();
			currentState.current.BallX = event.ball.x;
			currentState.current.BallY = event.ball.y;
			currentState.current.LeftY = event.left;
			currentState.current.RightY = event.right;
			currentState.current.Score.left = event.score.left;
			currentState.current.Score.right = event.score.right;
			if (!hasStarted) setHasStarted(true);
		});

		socket?.emit("room:join", { roomid: sessionStorage.getItem("roomId") });

		let animationFrameId: number;
		const renderLoop = () => {
			if (!hasStarted) {
				animationFrameId = requestAnimationFrame(renderLoop);
				return;
			}

			const now = performance.now();
			const delta = Math.min((now - lastUpdateTime.current) / 100, 1);
			const prev = previousState.current;
			const curr = currentState.current;

			let ballX = curr.BallX;
			let ballY = curr.BallY;
			let leftY = curr.LeftY;
			let rightY = curr.RightY;

			if (prev) {
				ballX = prev.BallX + (curr.BallX - prev.BallX) * delta;
				ballY = prev.BallY + (curr.BallY - prev.BallY) * delta;
				leftY = prev.LeftY + (curr.LeftY - prev.LeftY) * delta;
				rightY = prev.RightY + (curr.RightY - prev.RightY) * delta;
			}

			drawFrame(ballX, ballY, leftY, rightY);
			animationFrameId = requestAnimationFrame(renderLoop);
		};
		renderLoop();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			window.removeEventListener("keydown", keyDownEvent);
			window.removeEventListener("keyup", keyUpEvent);
			cancelAnimationFrame(animationFrameId);
		};
	}, [hasStarted]);

	return (
		<div className="relative w-full flex justify-center">
			<canvas
				ref={canvasRef}
				className="bg-black block mx-auto rounded-lg shadow-lg"
			/>
			{isGameOver && (
				<Button
					onClick={() => { setView("menu"); setShowSidebar(true); }}
					className="absolute top-1/2 translate-y-20 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-press-start rounded"
				>
					Lobby
				</Button>
			)}
		</div>
	);
}

