import { betterAuth } from "better-auth";
import {
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
} from "astro:env/server";
import { pool } from "~/server/db";

// The site promises not to store emails or usernames from Discord.
// Better Auth requires an email on every user, so we store a synthetic, non-routable one.
const syntheticEmail = (provider: string, id: string) => `${provider}_${id}@users.invalid`;

const timestamps = { createdAt: "created_at", updatedAt: "updated_at" } as const;

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: pool, // same pg pool as Kysely
	trustedOrigins: [BETTER_AUTH_URL],

	emailAndPassword: { enabled: false }, // Discord OAuth only

	socialProviders: {
		discord: {
			clientId: DISCORD_CLIENT_ID,
			clientSecret: DISCORD_CLIENT_SECRET,
			// Only `identify`: no email, no guilds
			disableDefaultScope: true,
			scope: ["identify"],
			mapProfileToUser: (profile) => ({
				email: syntheticEmail("discord", profile.id),
				emailVerified: false,
				name: "",
				image: undefined, // overrides the Discord avatar URL
			}),
		},
	},

	user: {
		modelName: "auth_user",
		fields: { emailVerified: "email_verified", ...timestamps },
		additionalFields: {
			// input: false → can never be set from the client. Promote admins in SQL.
			role: { type: "string", required: false, defaultValue: "user", input: false },
		},
	},

	session: {
		fields: {
			expiresAt: "expires_at",
			ipAddress: "ip_address",
			userAgent: "user_agent",
			userId: "user_id",
			...timestamps,
		},
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // refresh once a day
		cookieCache: { enabled: true, maxAge: 5 * 60 },
	},

	account: {
		fields: {
			accountId: "account_id",
			providerId: "provider_id",
			userId: "user_id",
			accessToken: "access_token",
			refreshToken: "refresh_token",
			idToken: "id_token",
			accessTokenExpiresAt: "access_token_expires_at",
			refreshTokenExpiresAt: "refresh_token_expires_at",
			...timestamps,
		},
		// Synthetic emails must never be used to auto-link accounts.
		accountLinking: { enabled: false },
		encryptOAuthTokens: true,
	},

	verification: {
		fields: { expiresAt: "expires_at", ...timestamps },
	},

	// Rate limiting is done by Cloudflare WAF, so Better Auth never needs client IPs.
	rateLimit: { enabled: false },

	advanced: {
		useSecureCookies: import.meta.env.PROD,
		ipAddress: { disableIpTracking: true },
	},

	databaseHooks: {
		session: {
			create: {
				// Don't store IP address or user agent
				before: async (session) => ({
					data: { ...session, ipAddress: null, userAgent: null },
				}),
			},
		},
		account: {
			// We never call Discord's API after login, so don't keep its tokens at all.
			create: {
				before: async (account) => ({
					data: {
						...account,
						accessToken: null,
						refreshToken: null,
						idToken: null,
						accessTokenExpiresAt: null,
						refreshTokenExpiresAt: null,
					},
				}),
			},
			update: {
				before: async (account) => ({
					data: {
						...account,
						accessToken: null,
						refreshToken: null,
						idToken: null,
						accessTokenExpiresAt: null,
						refreshTokenExpiresAt: null,
					},
				}),
			},
		},
	},
});

export type AuthSession = typeof auth.$Infer.Session;
// `role` comes from user.additionalFields; spelled out so it is typed even if inference changes.
export type AuthUser = AuthSession["user"] & { role?: string | null };
