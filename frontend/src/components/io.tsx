'use client'


// TODO move to contexts 

import { redirect } from "next/navigation";
import { useEffect, useState, createContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { TokenManager } from "@/lib/api";

const GameSocketContext = createContext<Socket | null>(null);

function GameSocketProvider({ children }: { children: React.ReactNode }) {
	const socketRef = useRef<Socket | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const token = TokenManager.getToken();
		if (!token) return;

		socketRef.current = io("http://localhost:8004", {
			path: "/socket.io",
			transports: ["websocket"],
			secure: window.location.protocol === 'https:',
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

		// Add unload handler for clean disconnect
		const handleUnload = () => {
			if (socketRef.current && socketRef.current.connected) {
				socketRef.current.disconnect();
			}
		};

		window.addEventListener("beforeunload", handleUnload);
		window.addEventListener("unload", handleUnload);

		return () => {
			socketRef.current?.disconnect();
			socketRef.current = null;
			window.removeEventListener("beforeunload", handleUnload);
			window.removeEventListener("unload", handleUnload);
		};
	}, []);


	return (
		<GameSocketContext.Provider value={connected ? socketRef.current : null}>
			{children}
		</GameSocketContext.Provider>
	);
}

export { GameSocketContext, GameSocketProvider };
