import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // This is a minimal/dummy config to satisfy the SessionProvider
                // Our real auth logic is in lib/auth.ts and custom API routes
                // But NextAuth needs to exist to prevent 404s if SessionProvider is used
                const user = { id: "1", name: "J Smith", email: "jsmith@example.com" };
                return user;
            }
        })
    ],
    // Ensure we don't block custom pages
    pages: {
        signIn: '/login',
    }
});

export { handler as GET, handler as POST };
