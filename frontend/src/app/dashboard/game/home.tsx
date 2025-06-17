"use client";
import React, { useEffect, useRef, useContext } from "react";
import { Merge, SmilePlus, Trophy, Users } from "lucide-react";
import { useState } from 'react';
// import getSocket from '@/components/io';
import { io, Socket } from 'socket.io-client'
import { redirect } from "next/navigation";

import { GameSocketProvider, GameSocketContext } from "@/components/io"

import { HeadButton, GameModeCard } from '@/components/ui/card'
import Tournament from "../test/page";
import Game from "./game"


export default function Home() {
	const socket = useContext(GameSocketContext);
	const [view, setView] = useState<"menu" | "1vs1-options" | "play" | "game" | "tournament">("menu")
	const [username, Setusername] = useState("");

	const [isQueueDisabled, setIsQueueDisabled] = useState(false);


	function quickStartHandler() {
		if (socket) {
			socket.emit('queue:join', "Quick Join Shit");
		}
		else {
			console.error("websocket is not open");
		}
	}

	useEffect(() => {

		if (!socket) return;

		const token = sessionStorage.getItem('jwtToken');
		if (!token) alert("Token Not Found");

		// const token = sessionStorage.getItem('jwtToken');
		// if (!token) redirect("/auth/login"); // NOTE redirect to login
		// socket.current = getSocket();

		socket?.on("welcome", (msg) => {
			console.log("[connected]", msg)
		})

		socket?.on('room:id', (event) => {
			console.log(`Room Id: ${event.roomid}`);
			sessionStorage.setItem('roomId', event.roomid);
			setView("game");
		});

		return (() => {
			socket?.disconnect();
		});

	}, [])

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

			{view !== "game" && view !== "tournament" && (
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
						Select Game Mode
					</h2>
					<div className="flex flex-wrap justify-center gap-8">
						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Users className="h-6 w-6 text-green-400" />
									<span>1 vs 1 Match</span>
								</div>
							}
							description="Challenge another player to a direct match. Test your skills in real-time and climb the leaderboard."
							buttonClassName="bg-green-600 hover:bg-green-500 text-white"
							buttonDisplayText="Play"
							onClick={() => setView("1vs1-options")}
						/>
						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Trophy className="text-amber-400" />
									<span>Tournament</span>
								</div>
							}
							description="Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies."
							buttonClassName="bg-amber-600 hover:bg-amber-500 text-white"
							buttonDisplayText="Join Tournament"
							onClick={() => setView("tournament")}
						/>
					</div>
				</section>
			)}

			{/* NOTE 1 vs 1 options  */}
			{view === "1vs1-options" && (
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
							buttonClassName="bg-blue-400 hover:bg-blue-500 text-white"
							buttonDisplayText="Queue"
							onClick={() => {
								setIsQueueDisabled(true);
								quickStartHandler();
							}}
						/>
						{/* <GameModeCard
								title={
									<div className="flex items-center justify-center space-x-2">
										<SmilePlus className="text-fuchsia-600" />
										<span>Invite a Friend</span>
									</div>
								}
								description="Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies."
								buttonClassName="bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
								buttonDisplayText="Invite"
							>
								<input
									type="text"
									placeholder="Enter username"
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
								/>
							</GameModeCard> */}

						{/* <InvitationCard /> */}
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
