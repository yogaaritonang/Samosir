import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { adapter } from "./db";

export const auth = betterAuth({
	database: adapter,
	trustedOrigins:
		process.env.NODE_ENV === "development"
			? ["http://localhost:3000", "http://127.0.0.1:3000"]
			: [],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 15,
		},
	},
	plugins: [tanstackStartCookies()],
});

export default auth;
