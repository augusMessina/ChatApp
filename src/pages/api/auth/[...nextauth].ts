import NextAuth, {
  Account,
  NextAuthOptions,
  Profile,
  Session,
  SessionStrategy,
} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserData } from "@/controllers/getUserData";
import { createUser } from "@/controllers/createUser";

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
        const userData = await getUserData(session.user.id);
        if (userData) {
          session.user.chats = userData.chats;
          session.user.friendList = userData.friendList;
          session.user.mailbox = userData.mailbox;
          session.user.language = userData.language;
          session.user.outgoingRequests = userData.outgoingRequests;
          session.user.name = userData.username;
        } else {
          session.user.email = undefined;
        }
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (
        (account?.provider === "google" || account?.provider === "github") &&
        profile &&
        profile.email
      ) {
        const data = await createUser(profile.email);

        if (data) {
          user.id = data.id;
          user.name = data.username;
          return true;
        }
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
          if (credentials?.email) {
            const data = await createUser(
              credentials?.email,
              credentials?.password
            );

            if (data && data.id) {
              return {
                id: data.id,
                email: credentials?.email,
                name: data.username,
              };
            }
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
