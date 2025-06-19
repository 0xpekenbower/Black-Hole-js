"use client"

import { useEffect, useRef, useContext, useState } from "react"
import { Socket } from "socket.io-client";
import { GameSocketProvider, GameSocketContext } from "@/components/io";
import { useView } from './view'
import { Button } from "@/components/ui/card";

interface gameOptions {
	BallRadius: number,
	PaddleWidth: number,
	PaddleHeight: number;
	canvasHeight: number,
	canvasWidth: number
}

interface scoreType {
	left: number,
	right: number
}

interface gameState {
	LeftX: number,
	RightX: number,
	LeftY: number,
	RightY: number,
	BallX: number,
	BallY: number,
	Score: scoreType
}

export default function Game() {
	const socket = useContext(GameSocketContext);
	const playerSideRef = useRef("");
	const [isGameOver, setIsGameOver] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const { view, setView } = useView();
	const canvasHeight = 400;
	const canvasWidth = 600;
	const scaleX = useRef(1);
	const scaleY = useRef(1);


	const _gameOptions: gameOptions = { BallRadius: 10, PaddleWidth: 10, PaddleHeight: 90, canvasHeight: 400, canvasWidth: 600 };
	const _score: scoreType = { left: 0, right: 0 };
	const _gameState: gameState = { LeftX: 1, RightX: 589, LeftY: 150, RightY: 150, BallX: canvasHeight / 2, BallY: canvasHeight / 2, Score: _score };

	function putText(text: string, xpos: number, ypos: number) {

		const ctx = ctxRef.current;
		if (!ctx) return;

		ctx.clearRect(0, 0, 600, 400);
		ctx.fillStyle = "white";
		ctx.font = '30px Arial';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillText(text, xpos, ypos);
	}


	const inputState = {
		up: false,
		down: false,
	};


	function init() {
		const ctx = ctxRef.current;
		if (!ctx) return;

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillStyle = "white";
		const playerSide = playerSideRef.current;

		ctx.fillStyle = playerSide === 'left' ? "red" : "white"
		ctx.fillRect(_gameState.LeftX, _gameState.LeftY, _gameOptions.PaddleWidth, _gameOptions.PaddleHeight);
		ctx.fillStyle = playerSide === 'right' ? "red" : "white"
		ctx.fillRect(_gameState.RightX, _gameState.RightY, _gameOptions.PaddleWidth, _gameOptions.PaddleHeight);
	}

	function drawCircle(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(
			_gameState.BallX * scaleX.current,
			_gameState.BallY * scaleY.current,
			_gameOptions.BallRadius * Math.min(scaleX.current, scaleY.current),
			0,
			Math.PI * 2
		);

		ctx.fillStyle = "white";
		ctx.fill();
	}


	function sendInput() {
		console.log("[EVENT SENT]");
		socket?.emit("game:paddle", inputState);
	}

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


	function render() {
		const ctx = ctxRef.current;
		const canvas = canvasRef.current;
		if (!ctx || !canvas) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";

		drawCircle(ctx);

		const playerSide = playerSideRef.current;
		const sx = scaleX.current;
		const sy = scaleY.current;

		ctx.fillStyle = playerSide === 'left' ? "red" : "white";
		ctx.fillRect(
			_gameState.LeftX * sx,
			_gameState.LeftY * sy,
			_gameOptions.PaddleWidth * sx,
			_gameOptions.PaddleHeight * sy
		);

		ctx.fillStyle = playerSide === 'right' ? "red" : "white";
		ctx.fillRect(
			_gameState.RightX * sx,
			_gameState.RightY * sy,
			_gameOptions.PaddleWidth * sx,
			_gameOptions.PaddleHeight * sy
		);

		ctx.fill();
	}


	const LOGICAL_WIDTH = 600;
	const LOGICAL_HEIGHT = 400;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;


		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctxRef.current = ctx;

		const aspectRatio = 3 / 2;

		const resizeCanvas = () => {
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

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);
		window.addEventListener('keydown', keyDownEvent);
		window.addEventListener('keyup', keyUpEvent);

		socket?.on('game:message', (event) => {
			console.log("[FRONT GOT MESSAGE]: ", event);
			putText(event.message, canvas.width / 2, canvas.height / 2);
		});

		socket?.on('game:result', (event) => {
			console.log("[FRONT GOT MESSAGE]: ", event);
			putText(event.message, canvas.width / 2, canvas.height / 2);
		});

		socket?.on('game:update', (event) => {
			_gameState.BallX = event.ball.x;
			_gameState.BallY = event.ball.y;
			_gameState.LeftY = event.left;
			_gameState.RightY = event.right;
			_gameOptions.PaddleWidth * scaleX.current,
				_gameOptions.PaddleHeight * scaleY.current
			render();
		});

		socket?.emit('room:join', { roomid: sessionStorage.getItem('roomId') });

		socket?.on('game:init', (event) => {
			playerSideRef.current = event.side;
			console.log("You are:", playerSideRef.current);
			init();
		});


		socket?.on('game:over', () => {
			setIsGameOver(true);
		});

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', keyDownEvent);
			window.removeEventListener('keyup', keyUpEvent);
		};
	}, []);



	return (
		<>
			{isGameOver ? (
				<Button onClick={() => setView('menu')} className="bg-blue-500 hover:bg-blue-600">
					{"Go lobby"}
				</Button>
			) : (
				<canvas
					ref={canvasRef}
					className="bg-black block mx-auto rounded-lg shadow-lg"
				/>
			)}
		</>
	)
}
