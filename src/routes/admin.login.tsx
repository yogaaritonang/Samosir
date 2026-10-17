import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { getServerSession } from "@/lib/server/auth";

export const Route = createFileRoute("/admin/login")({
	beforeLoad: async () => {
		const { session, isAdmin } = await getServerSession();
		if (session && isAdmin) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: AdminLogin,
});

function AdminLogin() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				setError(result.error.message || "Email atau kata sandi tidak valid.");
				return;
			}

			const { isAdmin } = await getServerSession();
			if (!isAdmin) {
				await authClient.signOut();
				setError("Akun ini tidak memiliki akses administrator.");
				return;
			}

			await navigate({ to: "/dashboard" });
		} catch {
			setError("Login gagal. Silakan coba kembali.");
		} finally {
			setLoading(false);
		}
	}

	if (isPending) {
		return (
			<main className="shop-page page-wrap px-4 py-12">
				<p className="text-[var(--sea-ink-soft)]">Memeriksa sesi...</p>
			</main>
		);
	}

	if (session?.user) {
		return (
			<main className="shop-page page-wrap px-4 py-12">
				<section className="mx-auto max-w-lg rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_45px_rgba(60,36,22,0.08)] sm:p-8">
					<p className="island-kicker mb-2">Portal pengelola</p>
					<h1 className="m-0 text-2xl font-bold text-[var(--sea-ink)]">
						Anda sedang masuk dengan akun pelanggan
					</h1>
					<p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
						Keluar dari akun ini untuk melanjutkan login administrator.
					</p>
					<button
						type="button"
						onClick={() => void authClient.signOut()}
						className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)]"
					>
						Keluar dari akun pelanggan
					</button>
				</section>
			</main>
		);
	}

	return (
		<main className="shop-page page-wrap px-4 py-10 sm:py-16">
			<section className="mx-auto max-w-lg rounded-[30px] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_24px_60px_rgba(60,36,22,0.08)] sm:p-9">
				<p className="island-kicker mb-2">Area khusus pengelola</p>
				<h1 className="m-0 text-3xl font-bold text-[var(--sea-ink)]">Login Admin</h1>
				<p className="mt-3 text-sm leading-6 text-[var(--sea-ink-soft)]">
					Masuk dengan akun administrator untuk mengelola toko Ulos.
				</p>

				<form onSubmit={handleSubmit} className="mt-7 space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="admin-email"
							className="block text-sm font-semibold text-[var(--sea-ink)]"
						>
							Email admin
						</label>
						<input
							id="admin-email"
							type="email"
							autoComplete="username"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[var(--lagoon-deep)]"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="admin-password"
							className="block text-sm font-semibold text-[var(--sea-ink)]"
						>
							Kata sandi
						</label>
						<input
							id="admin-password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[var(--lagoon-deep)]"
							required
						/>
					</div>

					{error && (
						<p
							role="alert"
							className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
						>
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-[#a94f32] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[rgba(124,67,43,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-75"
					>
						{loading ? "Memverifikasi..." : "Masuk sebagai admin"}
					</button>
				</form>
			</section>
		</main>
	);
}
