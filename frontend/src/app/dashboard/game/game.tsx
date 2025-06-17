"use client"

import { useEffect, useRef, useContext } from "react"
import { Socket } from "socket.io-client";
import { GameSocketProvider, GameSocketContext } from "@/components/io";

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
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const canvasHeight = 400;
	const canvasWidth = 600;

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
		ctx.arc(_gameState.BallX, _gameState.BallY, _gameOptions.BallRadius, 0, Math.PI * 2);
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
		if (!ctx) return;
		ctx.clearRect(0, 0, 600, 400);
		ctx.fillStyle = "white";
		drawCircle(ctx);
		const playerSide = playerSideRef.current;

		// ctx.font = '30px Arial';
		// ctx.fillText(`${_gameState.Score.left}`, 600 / 2 + 40, 30);
		// ctx.fillText(`${_gameState.Score.right}`, 600 / 2 - 40, 30);
		// console.log(_gameState.Score);

		ctx.fillStyle = playerSide === 'left' ? "red" : "white"
		ctx.fillRect(_gameState.LeftX, _gameState.LeftY, _gameOptions.PaddleWidth, _gameOptions.PaddleHeight);
		ctx.fillStyle = playerSide === 'right' ? "red" : "white"
		ctx.fillRect(_gameState.RightX, _gameState.RightY, _gameOptions.PaddleWidth, _gameOptions.PaddleHeight);
		ctx.fill();
	}

	// TODO protect everythign 

	useEffect(() => {

		const canvas = canvasRef.current;
		if (!canvas) return;

		ctxRef.current = canvas.getContext('2d');
		if (!ctxRef.current) return;


		canvas.width = 600;
		canvas.height = 400;


		window.addEventListener('keydown', keyDownEvent);
		window.addEventListener('keyup', keyUpEvent);

		socket?.on('game:message', (event) => {
			console.log("[FRONT GOT MESSAGE]: ", event);
			putText(event.message, canvasWidth / 2, canvasHeight / 2);
		});

		// ...this.paddles, ball: { x: this.ball.x, y: this.ball.y },
		// score: { ...this.score }

		socket?.on('game:update', (event) => {

			_gameState.BallX = event.ball.x;
			_gameState.BallY = event.ball.y;
			_gameState.LeftY = event.left;
			_gameState.RightY = event.right;
			// _gameState.Score.left = event.score.left;
			// _gameState.Score.right = event.score.right;
			render();
		});

		socket?.emit('room:join', { roomid: sessionStorage.getItem('roomId') });


		socket?.on('game:init', (event) => {
			playerSideRef.current = event.side;
			console.log("You are:", playerSideRef.current);
			init();
		});

		return () => {
			window.removeEventListener('keydown', keyDownEvent);
			window.removeEventListener('keyup', keyUpEvent);
		};
	}, [])

	return (
		<>
			<canvas ref={canvasRef} className="bg-black m-auto" id="gameRender" width={600} height={400}> </canvas>
		</>
	)
}
