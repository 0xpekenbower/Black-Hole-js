

'use client'


import { createContext, useContext, useState, ReactNode } from "react";

type ViewType = "menu" | "play" | "game" | "tournament";

interface ViewContextType {
	view: ViewType;
	setView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
	const [view, setView] = useState<ViewType>("menu");

	return (
		<ViewContext.Provider value={{ view, setView }}>
			{children}
		</ViewContext.Provider>
	);
}

export function useView() {
	const context = useContext(ViewContext);
	if (!context) throw new Error("useView must be used inside a ViewProvider");
	return context;
}

