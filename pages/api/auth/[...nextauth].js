import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { useRouter } from "next/router";

const authOptions = {
	// Configure one or more authentication providers
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
			async authorize(credentials, req) {
				// Add logic here to look up the user from the credentials supplied
				const { username, password } = credentials;

				try {
					const client = await clientPromise;
					const db = client.db("TeragramBallroom");
					const employeeCollection = db.collection("employees");
					const user = await employeeCollection.findOne({ username: username });

					if (!user) {
						console.log("not user");
						return null;
					}
					const passwordMatch = await bcrypt.compare(password, user.password);

					if (!passwordMatch) {
						console.log("not password");
						return null;
					}

					return user;
				} catch (error) {
					console.log("Error", error);
				}
			},
		}),

		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackUrl: `${process.env.NEXTAUTH_URL}Dashboard`, // Redirect URL after successful sign-in
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 60,
		// autoCommit: true,
	},

	secret: process.env.NEXTAUTH_SECRET,

	adapter: MongoDBAdapter(clientPromise),
	callbacks: {
		async session({ session, token, user }) {
			// Log session information for debugging
			// console.log("[...nextauth] Session:", session);
			// console.log("Token:", token);
			// console.log("User:", user);

			// Parse the ISO 8601 expiration time string into a Date object
			const expirationTimeUTC = new Date(session.expires);

			// Convert the expiration time to Pacific Standard Time (PST)
			const options = {
				timeZone: "America/Los_Angeles",
				timeZoneName: "short",
			};
			const expirationTimePST = expirationTimeUTC.toLocaleString(
				"en-US",
				options
			);

			// // Log the session expiry time in PST for debugging
			// console.log("[...nextauth] Session Expires (PST):", expirationTimePST);
			// // Parse the expiration time from the token
			// const expirationTime = token.exp;

			// // Get the current time
			// const currentTime = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds

			// // Check if the token has expired
			// if (expirationTime && expirationTime < currentTime) {
			// 	// Token has expired, log the user out or perform other actions
			// 	console.log("Session token has expired.");
			// 	// Example: Log the user out
			// 	return null; // Return null to invalidate the session
			// }
			return session;
		},

		async signIn({ user, account, profile }) {
			// Check if the account provider is Google

			if (account.provider === "google") {
				console.log("is google");
				try {
					const client = await clientPromise;
					const db = client.db("TeragramBallroom");
					const employeeCollection = db.collection("employees");

					// Check if the user's Google ID is already in the database
					console.log("profile ID", user.id);
					const existingUser = await employeeCollection.findOne({
						googleId: account.providerAccountId,
					});
					// console.log("existingUser", existingUser);
					if (!existingUser) {
						console.log("not in data base");
						// If the user's Google ID is not in the database, add it
						const result = await employeeCollection.updateOne(
							{ firstName: profile.given_name },
							{
								$set: {
									googleId: account.providerAccountId,
									email: profile.email,
									firstSignInDate: new Date(),
								},
							}
						);
						// Check if the update operation modified any documents
						if (result.modifiedCount === 0) {
							// If no documents were modified, return null
							console.log("updateOne failed: no documents modified");
							return null;
						}
					}
				} catch (error) {
					console.error("Error linking Google account:", error);
				}
			}

			if (user.email) {
				try {
					const client = await clientPromise;
					const db = client.db("TeragramBallroom");
					const employeeCollection = db.collection("employees");
					const email = user.email;
					// Check if the user's email exists in the database
					const existingUser = await employeeCollection.findOne({ email });
					if (!existingUser) {
						console.log("User with email does not exist in the database");
						return null; // Return null to prevent sign-in
					}

					// Return the user object to allow sign-in
					return existingUser;
				} catch (error) {
					console.error(
						"Error checking user existence in the database:",
						error
					);
					return null; // Return null in case of error
				}
			}

			return true;
		},
	},
};

export default NextAuth(authOptions);
