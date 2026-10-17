import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="shop-footer">
			<div className="page-wrap shop-footer-main">
				<div className="shop-footer-brand">
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
					<p>Merawat cerita dan tradisi tenun ulos, satu helai dalam satu waktu.</p>
				</div>
				<div className="shop-footer-links">
					<a href="/#koleksi">Jelajahi koleksi</a>
					<a href="/#cerita">Cerita ulos</a>
					<Link to="/demo/better-auth">Akun saya</Link>
				</div>
			</div>
			<div className="shop-footer-bottom">
				<div className="page-wrap flex flex-wrap items-center justify-between gap-2 px-4 py-4">
					<p className="m-0 text-xs">&copy; {year} Ulos. Ruang Karya Batak.</p>
					<p className="m-0 text-xs">Ditenun dengan sepenuh hati di Sumatera Utara.</p>
				</div>
			</div>
		</footer>
	);
}
