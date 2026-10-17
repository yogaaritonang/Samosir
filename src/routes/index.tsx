import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	Heart,
	PackageCheck,
	Plus,
	ShoppingBag,
	Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getCatalog } from "@/lib/server/products";

const categories = ["Semua", "Ulos premium", "Selendang", "Hadiah"] as const;
type Category = (typeof categories)[number];

const formatPrice = (price: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(price);

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>) => ({
		q: typeof search.q === "string" ? search.q : "",
	}),
	component: Home,
});

function Home() {
	const { q } = Route.useSearch();
	const catalogQuery = useQuery({
		queryKey: ["storefront", "catalog"],
		queryFn: async () => getCatalog(),
	});
	const products = catalogQuery.data ?? [];
	const [activeCategory, setActiveCategory] = useState<Category>("Semua");
	const [cartCount, setCartCount] = useState(0);
	const [addedProduct, setAddedProduct] = useState("");
	const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
	const visibleProducts = useMemo(() => {
		const normalizedQuery = q.trim().toLocaleLowerCase("id");
		return products.filter((product) => {
			const matchesCategory = activeCategory === "Semua" || product.category === activeCategory;
			const matchesQuery =
				!normalizedQuery ||
				`${product.name} ${product.detail} ${product.category}`
					.toLocaleLowerCase("id")
					.includes(normalizedQuery);
			return matchesCategory && matchesQuery;
		});
	}, [activeCategory, products, q]);

	useEffect(() => {
		if (!addedProduct) {
			return;
		}
		const timeoutId = window.setTimeout(() => setAddedProduct(""), 2400);
		return () => window.clearTimeout(timeoutId);
	}, [addedProduct]);

	function addToBag(productName: string) {
		setCartCount((count) => count + 1);
		setAddedProduct(productName);
	}

	function toggleFavorite(productName: string) {
		setFavoriteProducts((favorites) =>
			favorites.includes(productName)
				? favorites.filter((favorite) => favorite !== productName)
				: [...favorites, productName],
		);
	}

	if (catalogQuery.isPending) {
		return (
			<main className="shop-page page-wrap px-4 py-12">
				<p className="text-[var(--sea-ink-soft)]">Memuat toko...</p>
			</main>
		);
	}

	return (
		<main className="shop-page">
			<div className="shop-promise">
				<div className="page-wrap flex flex-wrap justify-center gap-x-8 gap-y-2 px-4 py-3 sm:justify-between">
					<span>
						<PackageCheck size={16} /> Gratis ongkir untuk pesanan pilihan
					</span>
					<span>
						<Check size={16} /> Dibuat langsung oleh perajin lokal
					</span>
					<span>
						<Heart size={16} /> Setiap helai punya cerita
					</span>
				</div>
			</div>

			<div className="page-wrap px-4 pb-16 pt-8 sm:pt-10">
				<section className="market-hero">
					<div className="market-hero-copy">
						<p className="shop-eyebrow">
							<Sparkles size={15} /> Tenun asli, cerita abadi
						</p>
						<h1>
							Warisan yang <span>selalu dekat.</span>
						</h1>
						<p className="market-hero-description">
							Temukan ulos pilihan yang ditenun sepenuh hati oleh perajin Tano Batak. Untuk momen
							istimewa, dan untuk cerita yang ingin terus hidup.
						</p>
						<div className="market-hero-actions">
							<a href="#koleksi" className="shop-primary-button">
								Jelajahi koleksi <ArrowRight size={17} />
							</a>
							<a href="#cerita" className="shop-text-link">
								Kenali kisah ulos <ArrowUpRight size={16} />
							</a>
						</div>
						<div className="hero-trust-row">
							<span>
								<strong>100%</strong> tenun tangan
							</span>
							<i />
							<span>
								<strong>Langsung</strong> dari perajin
							</span>
						</div>
					</div>
					<div className="market-hero-art" aria-label="Ilustrasi motif tenun ulos" role="img">
						<div className="hero-art-stamp">
							<span>01 / 06</span>
							<strong>
								Ragam
								<br />
								Nusantara
							</strong>
						</div>
						<div className="hero-art-caption">
							<span>Tenun pilihan minggu ini</span>
							<strong>Ulos Ragidup</strong>
						</div>
						<div className="hero-art-seal">
							TANO
							<br />
							BATAK
						</div>
					</div>
				</section>

				<section className="shop-category-strip" aria-label="Keunggulan toko">
					<div>
						<span className="category-icon">ᯤ</span>
						<p>
							<strong>Asli & autentik</strong>
							<small>Dari sentra tenun Sumatera Utara</small>
						</p>
					</div>
					<div>
						<span className="category-icon">ᯓ</span>
						<p>
							<strong>Tenun penuh makna</strong>
							<small>Motif dengan cerita turun-temurun</small>
						</p>
					</div>
					<div>
						<span className="category-icon">ᯅ</span>
						<p>
							<strong>Dukung perajin lokal</strong>
							<small>Belanja berdampak untuk komunitas</small>
						</p>
					</div>
				</section>

				<section id="koleksi" className="collection-section">
					<div className="section-heading">
						<div>
							<p className="shop-eyebrow">Pilihan untukmu</p>
							<h2>Temukan ulos favorit</h2>
							<p>Karya tradisi yang indah dipakai, bermakna saat diberikan.</p>
						</div>
						<div className="shop-bag-count" aria-live="polite">
							<ShoppingBag size={18} /> Tas belanja <strong>{cartCount}</strong>
						</div>
					</div>

					<fieldset className="category-filter border-0 p-0">
						<legend className="sr-only">Filter kategori produk</legend>
						{categories.map((category) => (
							<button
								key={category}
								type="button"
								className={
									activeCategory === category ? "category-chip is-selected" : "category-chip"
								}
								onClick={() => setActiveCategory(category)}
							>
								{category}
							</button>
						))}
					</fieldset>

					{q && (
						<p className="search-summary">
							Hasil pencarian untuk <strong>“{q}”</strong>
						</p>
					)}

					{visibleProducts.length > 0 ? (
						<div className="product-grid">
							{visibleProducts.map((product) => (
								<article className="shop-product-card" key={product.id}>
									<div className={`product-art product-art--${product.art}`}>
										{product.tag && <span className="product-tag">{product.tag}</span>}
										<button
											type="button"
											className={
												favoriteProducts.includes(product.name)
													? "product-favorite is-favorite"
													: "product-favorite"
											}
											aria-label={
												favoriteProducts.includes(product.name)
													? `Hapus ${product.name} dari favorit`
													: `Simpan ${product.name} ke favorit`
											}
											aria-pressed={favoriteProducts.includes(product.name)}
											title="Simpan ke favorit"
											onClick={() => toggleFavorite(product.name)}
										>
											<Heart
												size={17}
												fill={favoriteProducts.includes(product.name) ? "currentColor" : "none"}
											/>
										</button>
										<div className="woven-motif" aria-hidden="true">
											<span />
										</div>
										<span className="product-art-label">TENUN ASLI · TOBA</span>
									</div>
									<div className="product-info">
										<p className="product-origin">{product.detail}</p>
										<h3>{product.name}</h3>
										<p className="product-origin">{product.description}</p>
										<p className="product-price">{formatPrice(product.price)}</p>
										<div className="product-meta">
											<span>
												<span className="star">★</span> {product.rating}
											</span>
											<i />
											<span>{product.sold}+ terjual</span>
										</div>
										<button
											type="button"
											className="add-to-bag"
											onClick={() => addToBag(product.name)}
											disabled={product.stock <= 0}
										>
											<Plus size={16} />
											{product.stock > 0 ? "Tambah ke tas" : "Stok habis"}
										</button>
									</div>
								</article>
							))}
						</div>
					) : (
						<div className="empty-products">
							<p>Belum ada ulos yang cocok dengan pencarianmu.</p>
							<button type="button" onClick={() => setActiveCategory("Semua")}>
								Lihat semua koleksi
							</button>
						</div>
					)}
					{catalogQuery.isError && (
						<p className="mt-4 text-sm text-red-700" role="alert">
							Katalog gagal dimuat: {catalogQuery.error.message}
						</p>
					)}
				</section>

				<section id="cerita" className="artisan-story">
					<div className="story-pattern" aria-hidden="true">
						<div />
					</div>
					<div className="story-content">
						<p className="shop-eyebrow">Lebih dari selembar kain</p>
						<h2>
							Dititipkan dengan kasih.
							<br />
							<span>Diteruskan dengan bangga.</span>
						</h2>
						<p>
							Setiap ulos menyimpan doa, identitas, dan kehangatan keluarga. Dengan memilih karya
							perajin lokal, kamu ikut menjaga tradisi tetap hidup.
						</p>
						<a href="#koleksi" className="story-link">
							Jelajahi koleksi <ArrowRight size={16} />
						</a>
					</div>
					<div className="story-side-note">
						<span>ᯅ</span>
						<strong>Horas!</strong>
						<small>
							Dari Tano Batak,
							<br />
							dengan sepenuh hati.
						</small>
					</div>
				</section>
			</div>

			{addedProduct && (
				<output className="shop-toast" aria-live="polite">
					<Check size={18} />{" "}
					<span>
						<strong>{addedProduct}</strong> ditambahkan ke tas belanja.
					</span>
				</output>
			)}
		</main>
	);
}
