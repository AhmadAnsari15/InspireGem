/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // Google auth if needed
import bcrypt from "bcryptjs";

// Mocked list of users (In production, replace this with your DB logic)
const users = [
  {
    id: 1,
    name: "Arhan",
    email: "arhanansari2009@gmail.com",
    password: bcrypt.hashSync("Password123", 10) // Hashed password
  }
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "johndoe@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = users.find(user => user.email === credentials.email);

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return {
            id: String(user.id),  // Convert id from number to string
            name: user.name,
            email: user.email
          };
        } else {
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Pass user id to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id // Assign the id from token to session
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
});

// Instead of "export default", use "export" for route handling in Next.js 13+
export { handler as GET, handler as POST };