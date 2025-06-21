"use client";
import React, { useEffect, useRef, useContext } from "react";
import { Merge, SmilePlus, Trophy, Users } from "lucide-react";
import { useView } from './view'
import { useState } from 'react';
// import getSocket from '@/components/io';
import { io, Socket } from 'socket.io-client'
import { redirect } from "next/navigation";

import { GameSocketProvider, GameSocketContext } from "@/components/io"

import { HeadButton, GameModeCard } from '@/components/ui/card'
import { Button } from "@/components/ui/button";
import Tournament from "../test/page";
import Game from "./game"


export default function Home() {
	const socket = useContext(GameSocketContext);
	const [username, Setusername] = useState("");
	const { view, setView } = useView();
	const [isQueueDisabled, setIsQueueDisabled] = useState(false);
	const [canCancelQueue, setCanCancelQueue] = useState(false);


	function cancelQueueHandler() {
		if (!socket) return;
		socket.emit('queue:cancel', "Quick Join Shit");
	}

	function quickStartHandler() {
		if (!socket) return;
		socket.emit('queue:join', "Quick Join Shit");
	}

	useEffect(() => {

		console.log("Socket: ", socket);

		const token = sessionStorage.getItem('jwtToken');
		if (!token) alert("Token Not Found");

		// const token = sessionStorage.getItem('jwtToken');
		// if (!token) redirect("/auth/login"); // NOTE redirect to login
		// socket.current = getSocket();

		if (!socket) return;
		socket.on("welcome", (msg) => {
			console.log("[connected]", msg)
		})

		socket.on('room:id', (event) => {
			console.log(`Room Id: ${event.roomid}`);
			sessionStorage.setItem('roomId', event.roomid);
			setIsQueueDisabled(false);
			setCanCancelQueue(true);
			setView("game");
		});


		socket.on('queue:joined', (event) => {
			console.log("setCanCancelQueue()");
			setCanCancelQueue(true);
		});

	}, [socket])

	// const handlePlayClick = () => {
	// 	setView("options")
	// }

	// const quickStartHandler = () => {
	// 	if (socket.current) {
	// 		socket.current.emit('quick-join', "Quick Join Shit")
	// 	} else {
	// 		console.error("WebSocket not available")
	// 	}
	// setIsDisabled(true)

	return (
		// <div className="h-screen flex items-center justify-center space-x-5 bg-black">
		<>
			{/* TODO add goback button */}

			{view !== "game" && view !== "tournament" && socket && (
				<section className="py-16 text-center">
					<h2 className="text-5xl font-bold mb-4">Welcome to Pong Arena</h2>
					<p className="text-xl max-w-2xl mx-auto text-slate-700 dark:text-slate-300 ">
						Challenge players in real-time ping pong matches or participate in
						tournaments to climb the ranks.
					</p>
				</section>
			)}

			{view === "game" && (
				<div className="py-10">
					<Game />
				</div>

			)}


			{/* NOTE first view [1vs1  + Tournament] */}
			{view === "menu" && (

				<section className="my-6">
					<h2 className="text-2xl font-bold mb-10 text-center">
						Join Online Game
					</h2>
					<div className="flex flex-wrap justify-center gap-8">
						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Merge className="h-6 w-6 text-blue-400" />
									<span>Quick Start</span>
								</div>
							}
							description="is simply dummy text of the printing and typesetting industry. Lorem "
							footer={
								socket ? (
									isQueueDisabled && canCancelQueue ? (
										<Button
											onClick={() => {
												setIsQueueDisabled(false);
												cancelQueueHandler();
											}}
											className=" text-red-500 font-bold bg-transparent hover:bg-black border"
										>
											{"Cancel"}
										</Button>
									) : (
										<Button
											onClick={() => {
												setIsQueueDisabled(true);
												// setView("game");
												quickStartHandler();
											}}
											className=" text-white font-bold bg-transparent hover:bg-black border"
											disabled={isQueueDisabled && !canCancelQueue}
										>
											{isQueueDisabled ? "...Loading" : "Start"}
										</Button>
									)
								) : (
									<div>
										<h2 className="text-2xl text-red-700">Game api not available now, fuck off</h2>
									</div>
								)}
						/>

						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Trophy className="text-amber-400" />
									<span>Tournament</span>
								</div>
							}
							description="Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies."
						// footer
						/>
					</div>
				</section>
			)}

			{view === "tournament" && (
				<Tournament />
			)}

			{/* </div> */}
		</>
	)
}
