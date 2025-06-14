"use client";
import React, { useEffect, useRef } from "react";
import { Merge, SmilePlus, Trophy, Users } from "lucide-react";
import { useState } from 'react';
import getSocket from '@/components/io';
import { Socket } from 'socket.io-client'
import { redirect } from "next/navigation";

import { HeadButton, GameModeCard } from '@/components/ui/card'
// import Game from "@/components/game/render"



// import { useEffect, useRef, useState } from "react"

// interface IpageButton {
// 	clickHandler?: () => void,
// 	isDisabled?: boolean,
// 	display: string
// }

// function PageButton({ clickHandler, isDisabled = false, display }: IpageButton) {
// 	return (
// 		<div>
// 			<button
// 				className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none
// 				bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4
// 				focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600
// 				dark:hover:text-white dark:hover:bg-gray-700"
// 				onClick={clickHandler}
// 				disabled={isDisabled}>
// 				{display}
// 			</button>
// 		</div>
// 	)
// }


function InvitationCard() {
	const [username, setUsername] = useState('');

	const handleClick = () => {
		const socket = getSocket();
		if (!socket) {
			console.error('WebSocket not available');
			return;
		}

		console.log('Input:', username);
		socket.emit('invite:send', { target: username });
	};

	return (
		<GameModeCard
			title={
				<div className="flex items-center justify-center space-x-2">
					<SmilePlus className="text-fuchsia-600" />
					<span>Invite a Friend</span>
				</div>
			}
			description="s simply dummy text of the printing and typesetting industry. Lorem"
			buttonClassName="bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
			buttonDisplayText="Invite"
			onClick={handleClick}
		>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter username"
				className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
			/>
		</GameModeCard>
	);
}


// const handleClick = (text: string) => {

// 	const socket = getSocket();
// 	if (!socket) return;

// 	console.log('Input:', text);
// 	if (socket) {
// 		socket.emit('invite:send', { target: text });
// 	}
// 	else {
// 		console.error("websocket is not open");
// 	}
// };

export default function Home() {
	const socket = useRef<Socket | null>(null)
	const [view, setView] = useState<"menu" | "1vs1-options" | "play" | "game">("menu")
	const [isDisabled, setIsDisabled] = useState(false)
	const [username, Setusername] = useState("");

	function quickStartHandler() {
		if (socket.current) {
			socket.current.emit('quick-join', "Quick Join Shit");
		}
		else {
			console.error("websocket is not open");
		}
		// setIsLoading(true);
		setIsDisabled(true);
	}

	useEffect(() => {

		const token = sessionStorage.getItem('jwtToken');
		// if (!token) redirect("/auth/login"); // NOTE redirect to login
		socket.current = getSocket();

		socket.current?.on("welcome", (msg) => {
			console.log("[connected]", msg)
		})

		socket.current?.on("welcome", (msg) => {
			console.log("[connected]", msg)
		})

		socket.current?.on('room:id', (event) => {
			console.log(`Room Id: ${event.roomid}`);
			sessionStorage.setItem('roomId', event.roomid);
			setView("game");
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

			<div className="min-h-screen  from-slate-900 to-slate-800 text-dark dark:text-white">
				{/* // TODO header buttons and stuff commented here -> add go back here  */}
				{/* <header className="p-6 border-b border-slate-700 flex items-center justify-between"> */}
				{/* 	<h1 onClick={() => setView("menu")} className="text-xl font-bold">Pong Arena</h1> */}
				{/* 	<div className="flex space-x-4"> */}
				{/* 		{/* <InvitationsDropdown /> */}
				{/* 		<HeadButton>Settings</HeadButton> */}
				{/* 		<HeadButton>Profile</HeadButton> */}
				{/* 	</div> */}
				{/* </header> */}

				{view !== "game" && (
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
						{/* <Game /> */}
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
								onClick={() => setView("game")}
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

							<InvitationCard />
						</div>
					</section>
				)
				}

			</div>
		</>
	)
}
