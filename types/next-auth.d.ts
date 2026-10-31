import "next-auth";

// The app has no session callback, so NextAuth's default JWT session is what
// pages and API routes get: `user` is always filled in with these three fields.
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
