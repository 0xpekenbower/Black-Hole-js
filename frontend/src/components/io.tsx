
'use client'

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export default function getSocket() {
	if (typeof window === 'undefined') return null;
	if (!socket) {
		try {
			const token = sessionStorage.getItem('jwtToken')
			socket = io(`http://localhost:3001`, {
				path: '/socket.io',
				transports: ['websocket'],
				auth: {
					token: token
				},
				withCredentials: true
			});
		} catch (error) {
			console.log("[ERROR]", error);
		}
	}

	return socket;
}