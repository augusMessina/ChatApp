import NextAuth, {
  Account,
  NextAuthOptions,
  Profile,
  Session,
  SessionStrategy,
} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      // token.name = user.name;
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.name = token.name;

      session.user.image = "default_image.jpg";

      if (session.user.id) {
        const res = await fetch("http://back:8080/getUserData", {
          method: "POST",
          body: JSON.stringify({
            id: session.user.id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        session.user.chats = data.chats;
        session.user.friendList = data.friendList;
        session.user.mailbox = data.mailbox;
        session.user.language = data.language;
        session.user.outgoingRequests = data.outgoingRequests;
        session.user.name = data.username;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const res = await fetch("http://back:8080/createUser", {
          method: "POST",
          body: JSON.stringify({
            email: profile?.email,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          user.id = data.id;
          user.name = data.username;
        }
        return res.ok;
      }
      return true;
    },
  },
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
        },
        password: {
          label: "password",
          type: "text",
        },
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://back:8080/createUser", {
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (res.ok && data.id) {
            return {
              id: data.id,
              email: credentials?.email,
              name: data.username,
            };
          }

          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions);
