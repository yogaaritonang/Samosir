import { getServerSession } from "@/lib/server/auth";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/demo/better-auth")({
	component: BetterAuthDemo,
});

function BetterAuthDemo() {
	const { data: session, isPending } = authClient.useSession();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const signingUp = isSignUp;

	if (isPending) {
		return (
			<main className="shop-page page-wrap px-4 py-12">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink-soft)]">
					<span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--lagoon-deep)]" />
				</div>
			</main>
		);
	}

	if (session?.user) {
		const isAdmin = session.user.email === "admin@example.com";
		return (
			<main className="shop-page page-wrap px-4 py-12">
				<section className="mx-auto max-w-xl rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_45px_rgba(60,36,22,0.08)] sm:p-8">
					<div className="mb-6 flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--chip-bg)] text-lg font-bold text-[var(--sea-ink)]">
							{session.user.name?.charAt(0).toUpperCase() || "U"}
						</div>
						<div>
							<p className="island-kicker mb-1">Akun aktif</p>
							<h1 className="m-0 text-3xl font-bold text-[var(--sea-ink)]">
								{isAdmin ? "Admin ready" : "Selamat datang"}
							</h1>
						</div>
					</div>

					<div className="rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] p-4">
						<p className="m-0 text-sm text-[var(--sea-ink-soft)]">Masuk sebagai</p>
						<p className="mt-2 text-lg font-bold text-[var(--sea-ink)]">{session.user.email}</p>
						<p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
							{isAdmin ? "Panel administrator Ulos" : "Pelanggan Ulos"}
						</p>
					</div>

					<div className="mt-6 flex flex-wrap gap-3">
						{isAdmin ? (
							<Link
								to="/dashboard"
								className="rounded-xl bg-[#a94f32] px-5 py-3 text-sm font-semibold text-white no-underline shadow-lg shadow-[rgba(124,67,43,0.18)] transition hover:-translate-y-0.5"
							>
								Buka dashboard admin
							</Link>
						) : (
							<Link
								to="/"
								className="rounded-xl bg-[#a94f32] px-5 py-3 text-sm font-semibold text-white no-underline shadow-lg shadow-[rgba(124,67,43,0.18)] transition hover:-translate-y-0.5"
							>
								Lanjutkan berbelanja
							</Link>
						)}
						<button
							type="button"
							onClick={() => {
								void authClient.signOut();
							}}
							className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5"
						>
							Keluar akun
						</button>
					</div>
				</section>
			</main>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = signingUp
				? await authClient.signUp.email({
						email,
						password,
						name,
					})
				: await authClient.signIn.email({
						email,
						password,
					});

			if (result.error) {
				setError(result.error.message || "Autentikasi gagal");
				return;
			}
			if (!signingUp) {
				const { isAdmin } = await getServerSession();
				if (isAdmin) {
					await authClient.signOut();
					setError("Akun admin harus masuk melalui portal pengelola.");
				}
			}
		} catch {
			setError("Terjadi error yang tidak terduga. Coba lagi.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="shop-page page-wrap px-4 py-10 sm:py-16">
			<section className="mx-auto grid max-w-5xl gap-6 rounded-[32px] border border-[var(--line)] bg-[var(--surface-strong)] p-3 shadow-[0_24px_60px_rgba(60,36,22,0.08)] sm:p-5 lg:grid-cols-[1fr_1.1fr]">
				<div className="rounded-[26px] bg-[linear-gradient(135deg,#38251e,#5e362c,#9d5d42)] p-6 text-white sm:p-8">
					<p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#f1d0ad]">
						Ulos member
					</p>
					<h1 className="m-0 text-3xl font-black leading-tight sm:text-4xl">Belanja lebih mudah</h1>
					<p className="mt-4 max-w-md text-sm leading-7 text-[#f2dcc1]">
						Daftar atau masuk untuk menyimpan favorit, cek keranjang, dan menikmati pengalaman
						belanja ulos yang lebih personal.
					</p>

					<div className="mt-6 space-y-3 text-sm text-[#f8ead9]">
						<div className="flex items-center gap-3">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
								✓
							</span>
							<span>Produk tenun asli dari perajin lokal</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
								✓
							</span>
							<span>Wishlist dan keranjang tersimpan</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
								✓
							</span>
							<span>Pengalaman login yang aman dan cepat</span>
						</div>
					</div>
				</div>

				<div className="p-5 sm:p-7">
					<div className="mb-5 flex items-center justify-between gap-2">
						<div>
							<p className="island-kicker mb-1">Pelanggan</p>
							<h2 className="m-0 text-2xl font-bold text-[var(--sea-ink)]">
								{signingUp ? "Buat akun baru" : "Masuk ke akun"}
							</h2>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{signingUp && (
							<div className="space-y-2">
								<label htmlFor="name" className="block text-sm font-semibold text-[var(--sea-ink)]">
									Nama lengkap
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-3 text-sm text-[var(--sea-ink)] outline-none ring-0 transition focus:border-[var(--lagoon-deep)]"
									required
									placeholder="Masukkan nama Anda"
								/>
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="email" className="block text-sm font-semibold text-[var(--sea-ink)]">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[var(--lagoon-deep)]"
								required
								placeholder="nama@email.com"
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-semibold text-[var(--sea-ink)]"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[var(--lagoon-deep)]"
								required
								minLength={8}
								placeholder="Minimal 8 karakter"
							/>
						</div>

						{error && (
							<div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a94f32] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[rgba(124,67,43,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-75"
						>
							{loading ? "Memproses..." : signingUp ? "Daftar sekarang" : "Masuk akun"}
						</button>
					</form>

					<div className="mt-5 text-center text-sm text-[var(--sea-ink-soft)]">
						{isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
						<button
							type="button"
							onClick={() => {
								setIsSignUp(!isSignUp);
								setError("");
							}}
							className="font-bold text-[var(--lagoon-deep)] underline underline-offset-4"
						>
							{isSignUp ? "Masuk sekarang" : "Daftar sekarang"}
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
