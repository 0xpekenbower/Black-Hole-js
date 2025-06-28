
'user client';

import { GameSocketProvider, GameSocketContext } from "@/components/io"
import Home from "./home";



export default function Lobby() {

	return (
		<GameSocketProvider>
			<Home />
		</GameSocketProvider>
	)
}