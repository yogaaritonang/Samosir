import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import type { Product } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteProduct, getProducts } from "@/lib/server/products";
import { getUsers } from "@/lib/server/users";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const { session, isAdmin } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/admin/login" });
		}
		if (!isAdmin) {
			throw redirect({ to: "/" });
		}
	},
	component: Dashboard,
});

function Dashboard() {
	const queryClient = useQueryClient();
	const deleteProductFn = useServerFn(deleteProduct);
	const productsQuery = useQuery({
		queryKey: ["dashboard", "products"],
		queryFn: async () => getProducts(),
	});
	const usersQuery = useQuery({
		queryKey: ["dashboard", "users"],
		queryFn: async () => getUsers(),
	});

	const products = productsQuery.data ?? [];
	const users = usersQuery.data ?? [];
	const adminCount = users.filter((u) => u.role === "admin").length;

	async function handleDeleteProduct(product: Product) {
		if (!window.confirm(`Hapus ${product.name} dari katalog pelanggan?`)) {
			return;
		}
		try {
			await deleteProductFn({ data: { id: product.id } });
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["dashboard", "products"] }),
				queryClient.invalidateQueries({ queryKey: ["storefront", "catalog"] }),
			]);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Produk gagal dihapus.");
		}
	}

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-[28px] p-6 sm:p-8">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="island-kicker mb-2">Dashboard</p>
						<h1 className="display-title mb-1 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
							Panel Admin Ulos
						</h1>
						<p className="m-0 text-[var(--sea-ink-soft)]">
							Kelola katalog yang tampil di toko serta akun dan hak akses pengguna.
						</p>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<StatCard title="Products" value={products.length} />
					<StatCard title="Users" value={users.length} />
					<StatCard title="Administrators" value={adminCount} />
				</div>

				<div className="mt-8 grid gap-4 sm:grid-cols-2">
					<Card
						title="Katalog toko"
						subtitle="Tambah, ubah, dan hapus produk yang ditampilkan kepada pelanggan."
					>
						<Link
							to="/products/new"
							className="text-[var(--sea-ink)] font-medium underline underline-offset-4 hover:text-[var(--sea-ink)]"
						>
							Tambah produk baru &rarr;
						</Link>
						{" · "}
						<Link
							to="/products"
							className="text-[var(--sea-ink)] font-medium underline underline-offset-4 hover:text-[var(--sea-ink)]"
						>
							Kelola katalog lengkap
						</Link>
					</Card>
					<Card
						title="Akun pelanggan & admin"
						subtitle="Lihat pengguna, ubah peran, atau hapus akun."
					>
						<Link
							to="/users"
							className="text-[var(--sea-ink)] font-medium underline underline-offset-4 hover:text-[var(--sea-ink)]"
						>
							Kelola pengguna &rarr;
						</Link>
					</Card>
				</div>

				<div className="mt-8">
					<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
						<div>
							<p className="island-kicker mb-1">Konten storefront</p>
							<h2 className="m-0 text-2xl font-bold text-[var(--sea-ink)]">
								Produk yang dilihat pelanggan
							</h2>
						</div>
						<Link
							to="/products/new"
							className="rounded-xl bg-[#a94f32] px-4 py-2.5 text-sm font-bold text-white no-underline"
						>
							+ Tambah produk
						</Link>
					</div>

					{productsQuery.isPending ? (
						<p className="text-sm text-[var(--sea-ink-soft)]">Memuat katalog...</p>
					) : productsQuery.isError ? (
						<p role="alert" className="text-sm text-red-700">
							Katalog gagal dimuat: {productsQuery.error.message}
						</p>
					) : (
						<div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
							<table className="w-full border-collapse text-left text-sm">
								<thead className="bg-[var(--chip-bg)] text-xs text-[var(--sea-ink-soft)]">
									<tr>
										<th className="px-4 py-3">Produk</th>
										<th className="px-4 py-3">Kategori</th>
										<th className="px-4 py-3">Harga</th>
										<th className="px-4 py-3">Stok</th>
										<th className="px-4 py-3">Aksi</th>
									</tr>
								</thead>
								<tbody>
									{products.map((product) => (
										<tr key={product.id} className="border-t border-[var(--line)]">
											<td className="px-4 py-3">
												<strong className="block text-[var(--sea-ink)]">{product.name}</strong>
												<span className="text-xs text-[var(--sea-ink-soft)]">{product.detail}</span>
											</td>
											<td className="px-4 py-3">{product.category}</td>
											<td className="px-4 py-3">
												{new Intl.NumberFormat("id-ID", {
													style: "currency",
													currency: "IDR",
													maximumFractionDigits: 0,
												}).format(product.price)}
											</td>
											<td className="px-4 py-3">{product.stock}</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<Link
														to="/products/$productId"
														params={{ productId: product.id }}
														className="font-semibold text-[var(--lagoon-deep)] underline underline-offset-4"
													>
														Ubah
													</Link>
													<button
														type="button"
														onClick={() => void handleDeleteProduct(product)}
														className="font-semibold text-red-700 underline underline-offset-4"
													>
														Hapus
													</button>
												</div>
											</td>
										</tr>
									))}
									{products.length === 0 && (
										<tr>
											<td colSpan={5} className="px-4 py-8 text-center text-[var(--sea-ink-soft)]">
												Belum ada produk. Tambahkan produk agar tampil di beranda pelanggan.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{usersQuery.isError && (
					<p className="mt-4 text-sm text-red-600">
						Data pengguna gagal dimuat: {usersQuery.error.message}
					</p>
				)}
			</section>
		</main>
	);
}

function StatCard({ title, value }: { title: string; value: number }) {
	return (
		<div className="metric-card rounded-2xl p-5">
			<p className="m-0 text-sm text-[var(--sea-ink-soft)]">{title}</p>
			<p className="m-0 mt-1 text-3xl font-bold text-[var(--sea-ink)]">{value}</p>
		</div>
	);
}

function Card({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
}) {
	return (
		<div className="metric-card rounded-2xl p-5">
			<p className="m-0 text-sm text-[var(--sea-ink-soft)]">{title}</p>
			<p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">{subtitle}</p>
			<div className="mt-4">{children}</div>
		</div>
	);
}
