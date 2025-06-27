"use client"

import { useState } from "react"

interface PlayersGroup {
	player1: string;
	player2: string;
}



function GroupField({
	value,
	onChange,
	title,
	readonly = false
}: {
	value: PlayersGroup;
	onChange?: (value: PlayersGroup) => void;
	title: string;
	readonly?: boolean;
}) {
	return (
		<div className="w-full max-w-xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
			<h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 text-indigo-400">{title}</h2>

			<div className="flex flex-col sm:flex-row gap-4">
				<input
					placeholder="First player"
					value={value.player1}
					readOnly={readonly}
					onChange={(e) =>
						onChange && onChange({ ...value, player1: e.target.value })
					}
					className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
				/>
				<input
					placeholder="Second player"
					value={value.player2}
					readOnly={readonly}
					onChange={(e) =>
						onChange && onChange({ ...value, player2: e.target.value })
					}
					className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
				/>
			</div>
		</div>
	);
}



interface PongGameProps {
	players: { player1: string; player2: string };
	onGameEnd: (winner: string) => void;
}

const PongGame = ({ players, onGameEnd }: PongGameProps) => {
	return (
		<div className="w-full max-w-xl mx-auto bg-gray-900 border border-gray-700 rounded-xl shadow-md p-6 text-white text-center">
			<h2 className="text-2xl font-bold mb-4">🎮 Pong Match</h2>
			<p className="mb-6 text-lg">
				{players.player1} vs {players.player2}
			</p>

			<p className="text-gray-400 mb-4 italic">[Simulated match in progress...]</p>

			<div className="flex justify-center gap-4">
				<button
					className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md"
					onClick={() => onGameEnd(players.player1)}
				>
					{players.player1} Wins
				</button>
				<button
					className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md"
					onClick={() => onGameEnd(players.player2)}
				>
					{players.player2} Wins
				</button>
			</div>


			<div className="relative w-full flex justify-center">
				<canvas
					// ref={canvasRef}
					className="bg-black block mx-auto rounded-lg shadow-lg"
				/>

				{/* {isGameOver && (
			<Button
				onClick={() => setView("menu")}
				className="absolute top-1/2 translate-y-20 px-6 py-2  bg-emerald-700 hover:bg-emerald-800
					 text-white font-press-start rounded"
			>
				Lobby
			</Button>
		)} */}
			</div>

		</div>




	);
};

// export default PongGame;



const Tournament = () => {
	const initialGroups: PlayersGroup[] = [
		{ player1: "", player2: "" },
		{ player1: "", player2: "" }
	];

	const [mode, setMode] = useState<"lobby" | "playing" | "final" | "game">("lobby");
	const [groups, setGroups] = useState<PlayersGroup[]>(initialGroups);
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [winners, setWinners] = useState<PlayersGroup[]>([]);
	const [finalWinner, setFinalWinner] = useState<string | null>(null);
	const [pendingMatch, setPendingMatch] = useState<PlayersGroup | null>(null);

	const handleStart = () => {
		setCurrentGroupIndex(0);
		setWinners([]);
		setFinalWinner(null);
		setMode("playing");
	};

	// match func <- 
	const handleNext = () => {
		const currentGroup = groups[currentGroupIndex];

		setPendingMatch(currentGroup);
		setMode('game');

	};

	const handleFinal = () => {
		const finalGroup = winners[0] && winners[1]
			? { player1: winners[0].player1, player2: winners[1].player1 }
			: { player1: "", player2: "" };

		const finalPick =
			Math.random() < 0.5 ? finalGroup.player1 : finalGroup.player2;

		setFinalWinner(finalPick);


		// delay
		setTimeout(() => {
			setMode("lobby");
			setGroups(initialGroups);
			setWinners([]);
			setFinalWinner(null);
		}, 3000);
	};

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-3xl font-bold text-center mb-10">Tournament Bracket</h1>

			{mode === "lobby" && (
				<>
					<div className="space-y-4 mb-8">
						{groups.map((group, i) => (
							<GroupField
								key={i}
								value={group}
								onChange={(updatedGroup) => {
									const newGroups = [...groups];
									newGroups[i] = updatedGroup;
									setGroups(newGroups);
								}}
								title={`Group ${i + 1}`}
							/>
						))}
					</div>
					<div className="flex justify-center">
						<button
							onClick={handleStart}
							className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-md"
						>
							Start
						</button>
					</div>
				</>
			)}

			{mode === "playing" && (
				<div className="space-y-8">
					<GroupField
						value={groups[currentGroupIndex]}
						title={`Now Playing: Group ${currentGroupIndex + 1}`}
						readonly
					/>
					<div className="text-center text-lg">
						Click to pick a random winner!
					</div>
					<div className="flex justify-center">
						<button
							onClick={handleNext}
							className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-md"
						>
							{currentGroupIndex + 1 === groups.length ? "Go to Final" : "Next Group"}
						</button>
					</div>
				</div>
			)}

			{mode === "game" && pendingMatch && (
				<PongGame
					players={pendingMatch}
					onGameEnd={(winner) => {
						setWinners((prev) => [...prev, { player1: winner, player2: "TBD" }]);
						if (currentGroupIndex + 1 < groups.length) {
							setCurrentGroupIndex((prev) => prev + 1);
							setMode("playing");
						} else {
							setMode("final");
						}
					}}
				/>
			)}


			{mode === "final" && (
				<div className="space-y-6 text-center">
					<GroupField
						value={{
							player1: winners[0]?.player1 || "",
							player2: winners[1]?.player1 || "",
						}}
						title="🏁 Final Match"
						readonly
					/>
					{finalWinner ? (
						<div className="text-2xl font-bold text-green-400">
							🏆 Winner: {finalWinner}
						</div>
					) : (
						<button
							onClick={handleFinal}
							className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-md"
						>
							Pick Final Winner
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default Tournament;
