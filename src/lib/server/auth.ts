import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, db, getUserRole } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

/**
 * Server-only session lookup. Safe to call from TanStack Router `beforeLoad`
 * (which runs on the client during client navigation) because server
 * functions always execute on the server.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
	const current = await getCurrentSession();
	return {
		...current,
		isAdmin: current.user ? getUserRole(current.user.id) === "admin" : false,
	};
});

/**
 * One-time development seed: creates the administrator account (password
 * hashed by Better Auth) and seeds sample products. Idempotent.
 *
 * Called from the client via `useServerFn(seedAdmin)` on the /setup page.
 */
export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
	const hasAdmin = db.user.some((u) => {
		const role = db.userRole.find((r) => r.userId === u.id)?.role;
		return role === "admin";
	});
	if (!hasAdmin) {
		let adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
		if (!adminUser) {
			await auth.api.signUpEmail({
				body: {
					email: SEED_ADMIN_EMAIL,
					password: SEED_ADMIN_PASSWORD,
					name: "Administrator",
				},
				headers: new Headers(),
			});
			adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
		}
		if (adminUser) {
			const existing = db.userRole.find((r) => r.userId === adminUser.id);
			if (existing) {
				existing.role = "admin";
			} else {
				db.userRole.push({ userId: adminUser.id, role: "admin" });
			}
		}
	}

	const now = new Date().toISOString();
	const products = [
		{
			name: "Ulos Ragidup",
			description: "Tenun tangan dari Samosir, simbol doa dan kehidupan.",
			price: 2850000,
			stock: 12,
			category: "Ulos premium" as const,
			detail: "Tenun tangan · Samosir",
			art: "ragidup" as const,
			tag: "Karya istimewa",
			rating: 4.9,
			sold: 120,
		},
		{
			name: "Ulos Sadum Pusuk",
			description: "Tenun berwarna cerah dari Tapanuli untuk momen istimewa.",
			price: 1250000,
			stock: 5,
			category: "Ulos premium" as const,
			detail: "Tenun tangan · Tapanuli",
			art: "sadum" as const,
			tag: "Favorit",
			rating: 4.8,
			sold: 86,
		},
		{
			name: "Selendang Mangiring",
			description: "Selendang katun alami, ditenun oleh perajin Balige.",
			price: 680000,
			stock: 1,
			category: "Selendang" as const,
			detail: "Katun alami · Balige",
			art: "mangiring" as const,
			tag: "",
			rating: 4.9,
			sold: 54,
		},
		{
			name: "Ulos Bintang Maratur",
			description: "Tenun tangan bermotif bintang dari Toba.",
			price: 1950000,
			stock: 8,
			category: "Ulos premium" as const,
			detail: "Tenun tangan · Toba",
			art: "bintang" as const,
			tag: "Pilihan perajin",
			rating: 5,
			sold: 32,
		},
		{
			name: "Paket Hadiah Dalihan",
			description: "Ulos mini dalam paket hadiah bersama kartu cerita.",
			price: 425000,
			stock: 20,
			category: "Hadiah" as const,
			detail: "Ulos mini + kartu cerita",
			art: "hadiah" as const,
			tag: "Siap hadiah",
			rating: 4.8,
			sold: 67,
		},
		{
			name: "Selendang Sibolang",
			description: "Selendang tenun lembut dari Tarutung.",
			price: 790000,
			stock: 7,
			category: "Selendang" as const,
			detail: "Tenun lembut · Tarutung",
			art: "sibolang" as const,
			tag: "",
			rating: 4.9,
			sold: 41,
		},
	].map((p) => ({
		id: crypto.randomUUID(),
		...p,
		createdAt: now,
		updatedAt: now,
	}));
	const productsSeeded = db.product.length === 0;
	if (productsSeeded) {
		db.product.push(...products);
	}

	return { ok: true, alreadySeeded: hasAdmin, productsSeeded, admin: SEED_ADMIN_EMAIL };
});
