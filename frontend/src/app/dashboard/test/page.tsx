
// "use client"

// import { useState, ReactNode } from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/card"
// import { Group } from "lucide-react"

// interface PlayersGroup {
// 	player1: string,
// 	player2: string
// };


// type GroupFieldInput = {
// 	children: ReactNode;
// 	value: PlayersGroup;
// 	onChange: (value: PlayersGroup) => void;
// };




// function GroupField({ children, value, onChange }: GroupFieldInput) {
// 	return (
// 		<div className="w-full max-w-xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6 text-white">
// 			<h2 className="text-lg sm:text-xl font-bold mb-4 text-center">{children}</h2>

// 			<div className="flex flex-col sm:flex-row gap-4">
// 				<input
// 					placeholder="First player"
// 					onChange={(e) => onChange({ ...value, player1: e.target.value })}
// 					className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
// 				/>
// 				<input
// 					placeholder="Second player"
// 					onChange={(e) => onChange({ ...value, player2: e.target.value })}
// 					className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
// 				/>
// 			</div>
// 		</div>
// 	);
// }


// const Tournament = () => {
// 	const [count, setCount] = useState(4);
// 	const [mode, setMode] = useState<"lobby" | "playing">("lobby");
// 	const [groups, setGroups] = useState<PlayersGroup[]>(Array(count / 2).fill({ player1: "", player2: "" }));
// 	const handleCountChange = (e: any) => {
// 		const newCount = parseInt(e.target.value);
// 		setGroups(Array(newCount / 2).fill({ player1: "", player2: "" }));
// 		setCount(newCount);
// 	};

// 	const [matches, setMatches] = useState([]);

// 	const DisplayGroups = () => {
// 		const matchesList = []

// 		for (let i = 0; i <= (groups.length / 2); i += 2) {
// 			const match = [groups[i], groups[i + 1]];
// 			matchesList.push(match);
// 		}


// 		matchesList.forEach(match => {
// 			console.log(match);
// 		});


// 		// start matches in order one by one 
// 		// push the winners to another list 
// 		// repeat until one player os left 


// 	};

// 	return (
// 		<>
// 			{mode === "lobby" && (
// 				<>

// 					<Button onClick={DisplayGroups} className="bg-cyan-400">
// 						Start
// 					</Button>

// 					<select value={count} onChange={handleCountChange}>
// 						<option value="4">4</option>
// 						<option value="8">8</option>
// 						<option value="16">16</option>
// 					</select>


// 					<div className="max-w-3xl mx-auto px-4 py-8">
// 						<h1 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">Tournament Brackets</h1>

// 						<div className="space-y-3">
// 							{groups.map((group, i) => (
// 								<GroupField key={i}
// 									value={group}
// 									onChange={(updatedGroup) => {
// 										const newGroups = [...groups];
// 										newGroups[i] = updatedGroup;
// 										setGroups(newGroups);
// 									}}
// 								>{`Group ${i + 1}`}</GroupField>
// 							))}
// 						</div>
// 					</div>

// 				</>
// 			)}
// 		</>
// 	);
// };


// export default Tournament;


"use client"

import { useState } from 'react';
import Head from 'next/head';
import { redirect } from 'next/navigation';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Login attempt:', { username, password });
		fetch("http://localhost:3001/login", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password })
		})
			// .then(res => res.json())
			.then((res) => {
				console.log(res.headers);
				console.log('Authorization: ', res.headers.get('Authorization'));
				const token = res.headers.get('Authorization')?.split(' ')[1];
				if (!token)
					throw new Error("Token Not Found ");
				sessionStorage.setItem('jwtToken', token);
				console.log(token);
			})
			.catch(error => {
				console.log('Error:', error);
			});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Head>
				<title>Login</title>
			</Head>

			<div className="bg-white p-8 rounded shadow-md w-80">
				<h1 className="text-xl font-bold mb-6 text-center">Login</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded"
						/>
					</div>
					<div>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded"
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
}