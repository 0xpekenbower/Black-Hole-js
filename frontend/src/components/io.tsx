'use client'

import { useEffect, useState, createContext } from "react";
import { io, Socket } from "socket.io-client";

const GameSocketContext = createContext<Socket | null>(null);

function GameSocketProvider({ children }: { children: React.ReactNode }) {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const token = sessionStorage.getItem('jwtToken');
		if (!token) return;

		const socketInstance = io("http://localhost:3001", {
			path: "/socket.io",
			transports: ["websocket"],
			auth: { token },
			withCredentials: true,
		});

		socketInstance.on("welcome", (msg) => {
			console.log("[GameSocket connected]:", msg);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, []);

	return (
		<GameSocketContext.Provider value={socket}>
			{children}
		</GameSocketContext.Provider>
	);
}

export {
	GameSocketContext,
	GameSocketProvider
};
