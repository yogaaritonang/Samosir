import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Store } from "lucide-react";
import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="shop-header sticky top-0 z-50">
			<div className="shop-topline">
				<div className="shop-nav-wrap flex items-center justify-between gap-3 py-2 text-xs">
					<p className="m-0">Karya tangan, warisan yang terus hidup.</p>
				</div>
			</div>

			<nav className="shop-nav-wrap flex flex-wrap items-center gap-3 py-3 sm:gap-6 sm:py-4">
				<Link to="/" className="shop-brand">
					<span className="shop-brand-mark">
						<Store size={21} strokeWidth={2.2} />
					</span>
					<span>
						<strong>
							Ulos<span className="shop-brand-accent">.</span>
						</strong>
						<small>Ruang Karya Batak</small>
					</span>
				</Link>

				<div className="hidden items-center gap-6 text-sm font-semibold md:flex">
					<Link to="/" className="shop-nav-link">
						Beranda
					</Link>
					<a href="/#koleksi" className="shop-nav-link">
						Koleksi
					</a>
					<a href="/#cerita" className="shop-nav-link">
						Cerita Ulos
					</a>
				</div>

				<form
					action="/"
					method="get"
					className="shop-search order-3 w-full sm:order-none sm:ml-auto sm:w-auto sm:flex-1 sm:max-w-md"
				>
					<Search size={18} aria-hidden="true" />
					<input
						name="q"
						placeholder="Cari ulos, motif, atau pengrajin..."
						aria-label="Cari produk"
					/>
					<button type="submit">Cari</button>
				</form>

				<div className="ml-auto flex items-center gap-2 sm:ml-0">
					<div className="shop-account">
						<BetterAuthHeader />
					</div>
					<ThemeToggle />
					<a href="/#koleksi" className="shop-bag" aria-label="Lihat koleksi">
						<ShoppingBag size={19} />
					</a>
				</div>
			</nav>
		</header>
	);
}
