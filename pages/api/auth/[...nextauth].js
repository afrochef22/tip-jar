// import NextAuth from "next-auth";
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import clientPromise from "../../../lib/mongodb";
// import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import AzureADProvider from "next-auth/providers/azure-ad";
// import EmailProvider from "next-auth/providers/email";

// export const authOptions = {
// 	// Configure one or more authentication providers
// 	providers: [
// 		GithubProvider({
// 			clientId: process.env.GITHUB_ID,
// 			clientSecret: process.env.GITHUB_SECRET,
// 		}),
// 		GoogleProvider({
// 			clientId: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 		}),
// 		AzureADProvider({
// 			clientId: process.env.AZURE_AD_CLIENT_ID,
// 			clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
// 			tenantId: process.env.AZURE_AD_TENANT_ID,
// 		}),

// 		// EmailProvider({
// 		// 	server: process.env.EMAIL_SERVER,
// 		// 	from: process.env.EMAIL_FROM,
// 		// }),
// 		EmailProvider({
// 			server: {
// 				host: process.env.EMAIL_SERVER_HOST,
// 				port: process.env.EMAIL_SERVER_PORT,
// 				auth: {
// 					user: process.env.EMAIL_SERVER_USER,
// 					pass: process.env.EMAIL_SERVER_PASSWORD,
// 				},
// 			},
// 			from: process.env.EMAIL_FROM,
// 		}),
// 		// ...add more providers here
// 	],
// 	adapter: MongoDBAdapter(clientPromise),
// };

// export default NextAuth(authOptions);
