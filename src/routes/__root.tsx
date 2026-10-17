import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";
import BetterAuthHeader from "../integrations/better-auth/header-user";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootLayout,
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Ulos | Ruang Karya Batak",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="id" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function RootLayout() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isAdminArea =
		pathname === "/admin/login" ||
		pathname === "/setup" ||
		pathname === "/dashboard" ||
		/^\/(products|users)(\/|$)/.test(pathname);
	const hasAdminNavigation =
		pathname === "/dashboard" || pathname.startsWith("/products") || pathname.startsWith("/users");

	if (isAdminArea) {
		return (
			<div className="admin-app min-h-screen">
				<header className="border-b border-[var(--line)] bg-[var(--surface-strong)]">
					<div className="page-wrap flex flex-wrap items-center justify-between gap-4 px-4 py-4">
						<Link to={hasAdminNavigation ? "/dashboard" : "/admin/login"} className="no-underline">
							<strong className="block text-lg text-[var(--sea-ink)]">ULOS / ADMIN</strong>
							<span className="text-xs text-[var(--sea-ink-soft)]">Portal pengelolaan toko</span>
						</Link>
						{hasAdminNavigation && (
							<div className="flex flex-wrap items-center gap-2">
								<nav
									aria-label="Navigasi admin"
									className="flex flex-wrap gap-2 text-sm font-semibold"
								>
									<Link to="/dashboard" className="admin-nav-link">
										Dashboard
									</Link>
									<Link to="/products" className="admin-nav-link">
										Katalog
									</Link>
									<Link to="/users" className="admin-nav-link">
										Pengguna
									</Link>
								</nav>
								<BetterAuthHeader />
							</div>
						)}
					</div>
				</header>
				<Outlet />
			</div>
		);
	}

	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
}
