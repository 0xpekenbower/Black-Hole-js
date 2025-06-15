
"use client"

import { useState, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/card"
import { Group } from "lucide-react"

interface PlayersGroup {
	player1: string,
	player2: string
}


type GroupFieldInput = {
	children: ReactNode;
	value: PlayersGroup;
	onChange: (value: PlayersGroup) => void;
};


function GroupField({ children, value, onChange }: GroupFieldInput) {
	return (
		<div className="w-full max-w-xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6 text-white">
			<h2 className="text-lg sm:text-xl font-bold mb-4 text-center">{children}</h2>

			<div className="flex flex-col sm:flex-row gap-4">
				<input
					placeholder="First player"
					onChange={(e) => onChange({ ...value, player1: e.target.value })}
					className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<input
					placeholder="Second player"
					onChange={(e) => onChange({ ...value, player2: e.target.value })}
					className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>
	);
}


const Tournament = () => {
	const [count, setCount] = useState(4);
	const [mode, setMode] = useState<"lobby" | "playing">("lobby");
	// const [players, setPlayers] = useState(Array(4).fill(''));
	const [groups, setGroups] = useState<PlayersGroup[]>(Array(count / 2).fill({ player1: "", player2: "" }));

	const handleCountChange = (e: any) => {
		const newCount = parseInt(e.target.value);
		setGroups(Array(newCount / 2).fill({ player1: "", player2: "" }));
		setCount(newCount);
	};

	const DisplayGroups = () => {
		console.log("Groups:", groups);
	};

	return (
		<>
			{mode === "lobby" && (
				<>

					<Button onClick={DisplayGroups} className="bg-cyan-400">
						Start
					</Button>

					<select value={count} onChange={handleCountChange}>
						<option value="4">4</option>
						<option value="8">8</option>
						<option value="16">16</option>
					</select>


					<div className="max-w-3xl mx-auto px-4 py-8">
						<h1 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">Tournament Brackets</h1>

						<div className="space-y-3">
							{groups.map((group, i) => (
								<GroupField key={i}
									value={group}
									onChange={(updatedGroup) => {
										const newGroups = [...groups];
										newGroups[i] = updatedGroup;
										setGroups(newGroups);
									}}
								>{`Group ${i + 1}`}</GroupField>
							))}
						</div>
					</div>

				</>
			)}
		</>
	);
};


export default Tournament;