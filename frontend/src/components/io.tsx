'use client'

import { redirect } from "next/navigation";
import { useEffect, useState, createContext, useRef } from "react";
import { io, Socket } from "socket.io-client";

const GameSocketContext = createContext<Socket | null>(null);

function GameSocketProvider({ children }: { children: React.ReactNode }) {
	const socketRef = useRef<Socket | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const token = sessionStorage.getItem('jwtToken');
		if (!token) return;

		socketRef.current = io("http://localhost:8004", {
			path: "/socket.io",
			transports: ["websocket"],
			auth: { token },
			withCredentials: true,
		});

		socketRef.current.on("connect", () => {
			setConnected(true);
			console.log("[GameSocket connected]");
		});

		socketRef.current.on("disconnect", () => {
			setConnected(false);
			console.log("[GameSocket disconnected]");
		});

		return () => {
			socketRef.current?.disconnect();
			socketRef.current = null;
		};
	}, []);

	return (
		<GameSocketContext.Provider value={connected ? socketRef.current : null}>
			{children}
		</GameSocketContext.Provider>
	);
}

export { GameSocketContext, GameSocketProvider };
