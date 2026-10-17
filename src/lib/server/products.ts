import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Product, db } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/session";

export const productSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	price: z.coerce.number().min(0, "Price must be positive"),
	stock: z.coerce.number().min(0, "Stock must be positive"),
	category: z.enum(["Ulos premium", "Selendang", "Hadiah"]),
	detail: z.string().min(1, "Product origin/details are required"),
	art: z.enum(["ragidup", "sadum", "mangiring", "bintang", "hadiah", "sibolang"]),
	tag: z.string(),
	rating: z.coerce.number().min(0).max(5),
	sold: z.coerce.number().int().min(0),
});

export type ProductInput = z.infer<typeof productSchema>;

function normalizeProducts() {
	const products = db.product.map((product) => ({
		...product,
		category: product.category ?? "Ulos premium",
		detail: product.detail ?? product.description,
		art: product.art ?? "ragidup",
		tag: product.tag ?? "",
		rating: product.rating ?? 5,
		sold: product.sold ?? 0,
	}));
	db.product.splice(0, db.product.length, ...products);
	return products;
}

// TanStack Start server functions support GET and POST only. Mutations use
// POST and encode the intended action in the validator/body.
export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAuth();
	return normalizeProducts().sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
	return normalizeProducts().sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const now = new Date().toISOString();
		const product = {
			id: crypto.randomUUID(),
			...data,
			createdAt: now,
			updatedAt: now,
		} as Product;
		db.product.push(product);
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			...productSchema.shape,
		}),
	)
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Product not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const now = new Date().toISOString();
		const updated = {
			...db.product[index],
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			category: data.category,
			detail: data.detail,
			art: data.art,
			tag: data.tag,
			rating: data.rating,
			sold: data.sold,
			updatedAt: now,
		} as Product;
		db.product[index] = updated;
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Product not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		db.product.splice(index, 1);
		return { ok: true };
	});
