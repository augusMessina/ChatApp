This is the [Next.js](https://nextjs.org/) project of a chat application named Tradunite. It uses ChatGPT to translate messages between users. Made by [Augusto Messina](https://github.com/augusMessina)

## Getting Started

First, install all the dependencies by using:

```bash
npm install
#or
yarn
```

Second, include all the necessary environment variables in the `.env.local`:

- `NEXTAUTH_SECRET`: Secret key of NextAuth.js. You can obtain yours through [this link](https://generate-secret.vercel.app/32).
- `OPENAI_API_KEY`: API key for interacting with ChatGPT API. There is a free trial on OpenAI's website.
- `MONGODB_URI`: URI to your MongoDB Atlas cluster.
- `MONGODB_DBNAME`: Name of your database.
- `PUSHER_APP_ID`: ID of your [Pusher](https://pusher.com/) application.
- `NEXT_PUBLIC_PUSHER_KEY`.
- `PUSHER_SECRET`.
- `NEXT_PUBLIC_PUSHER_CLUSTER`.
- `GITHUB_CLIENT_ID`: ID of your [Github OAuth application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
- `GITHUB_CLIENT_SECRET`.
- `ADMIN_KEY`: Key for accesing admin functions.

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
