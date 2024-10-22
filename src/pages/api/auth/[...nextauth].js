import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Optional: next-auth secret for better security
  pages: {
    signIn: '/social_login',  // 로그인 페이지 설정 (원하는 페이지로 변경 가능)
    // error: '/auth/error',    // 에러 발생 시 이동할 페이지 설정
  },
});
