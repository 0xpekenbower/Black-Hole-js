import { ViewProvider } from "./view";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<ViewProvider>{children}</ViewProvider>
	);
}