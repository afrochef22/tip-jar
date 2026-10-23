import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { reportError } from "../../../lib/alert";

async function employeesCollection() {
	const client = await clientPromise;
	return client.db("TeragramBallroom").collection("employees");
}

export const authOptions = {
	providers: [
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: process.env.EMAIL_SERVER_PORT,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const username = credentials?.username;
				const password = credentials?.password;
				if (typeof username !== "string" || typeof password !== "string") {
					return null;
				}
				if (!username || !password) return null;

				try {
					const employees = await employeesCollection();
					const user = await employees.findOne({ username });
					if (!user || typeof user.password !== "string") return null;

					const passwordMatch = await bcrypt.compare(password, user.password);
					if (!passwordMatch) return null;

					return {
						id: user._id.toString(),
						name: `${user.firstName} ${user.lastName}`,
						email: user.email ?? null,
					};
				} catch (error) {
					await reportError("Password sign-in", error);
					return null;
				}
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
	},
	// TipJar-styled sign-in page; NextAuth sends errors there as ?error=<code>.
	pages: {
		signIn: "/signin",
		error: "/signin",
	},
	secret: process.env.NEXTAUTH_SECRET,
	adapter: MongoDBAdapter(clientPromise, { databaseName: "TeragramBallroom" }),
	callbacks: {
		// Only people already in the employees collection may sign in.
		// Credentials sign-in was already verified against that collection.
		async signIn({ user, account }) {
			if (account?.provider === "credentials") return true;

			const email = user?.email;
			if (!email) return false;

			try {
				const employees = await employeesCollection();
				const existing = await employees.findOne({ email });
				if (!existing) return false;

				if (account?.provider === "google") {
					// A Google sign-in completes registration: link the account and
					// consume any pending registration link.
					const $set = {};
					if (!existing.googleId) $set.googleId = account.providerAccountId;
					if (!existing.firstSignInDate) $set.firstSignInDate = new Date();
					const update = { $unset: { token: "", tokenExpiration: "" } };
					if (Object.keys($set).length) update.$set = $set;
					await employees.updateOne({ _id: existing._id }, update);
				}
				return true;
			} catch (error) {
				await reportError("Sign-in employee check", error);
				return false;
			}
		},
	},
};

export default NextAuth(authOptions);
