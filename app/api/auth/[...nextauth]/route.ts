// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { adminDb } from "@/firebaseAdmin";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  adapter: FirestoreAdapter(adminDb),
  callbacks: {
    async signIn({ user, account }) {
      const userEmail = user.email;
      const provider = account?.provider;

      if (!userEmail) return false;

      try {
        const userDocRef = adminDb.collection("users").doc(userEmail);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log("Existing user signing in:", userData); // Log existing user data

          if (userData?.provider && userData.provider !== provider) {
            const linkedProviders = userData.linkedProviders || [];
            if (!linkedProviders.includes(provider)) {
              linkedProviders.push(provider);
              await userDocRef.update({ linkedProviders });
            }
          } else if (!userData?.provider) {
            await userDocRef.update({ provider });
          }

          return true;
        } else {
          console.log("New user signing up:", { email: userEmail, provider }); // Log new user data
          
          await userDocRef.set({
            email: userEmail,
            plan: "free",
            requestCount: 0,
            provider,
            linkedProviders: [provider],
          });
          return true;
        }
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },
    
    async session({ session, user }) {
      console.log("Session data:", session); // Log session data
      session.user.id = user.id;
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      console.log("User signed in:", user);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
