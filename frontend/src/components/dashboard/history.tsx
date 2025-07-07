
import { useEffect, useState } from 'react';



interface GameHistoryEntry {
	rival_id: number;
}

function History() {
	const [history, setHistory] = useState<GameHistoryEntry[]>([]);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				// const res = await fetch("http://localhost:8004/api/game/history"); // FIXME change to the real api
				const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/game/history"); // FIXME change to the real api
				if (!res.ok)
					throw new Error("failed to fetch data");
				const data = await res.json();
				console.log(data);
				setHistory(data);
			} catch (error) {
				console.error("Failed to fetch history:", error);
			}
		};

		fetchHistory();
	}, []);

	return (
		<div>
			{history.length === 0 ? (
				<p className="text-gray-500 italic">No activity yet.</p>
			) : (
				history.map((entry, index) => (
					<div key={index} className="pb-2 border-b">
						You played a game against{" "}
						<a
							href={`/dashboard/profile/?id=${entry.rival_id}`}
							className="text-blue-500 hover:underline"
						>
							{entry.rival_id}
						</a>
					</div>
				))
			)}
		</div>
	);
}


export default History;