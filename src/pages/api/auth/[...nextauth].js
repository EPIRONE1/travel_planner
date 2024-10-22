import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Optional: Secure secret for NextAuth
  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider === "google" && profile.email_verified) {
        return true; // 인증 성공
      } else {
        return false; // 인증 실패
      }
    },
  },
});