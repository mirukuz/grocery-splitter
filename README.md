This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

To deploy the Household Calculator application on Vercel, follow these steps:

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect your repository to Vercel**:
   - Go to [Vercel](https://vercel.com/new) and sign in or create an account
   - Import your repository
   - Select the repository containing your Household Calculator code

3. **Configure the project**:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

4. **Add environment variables**:
   - Add your `DATABASE_URL` environment variable for your PostgreSQL database
   - You can use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or any other PostgreSQL provider

5. **Deploy**:
   - Click 'Deploy' and wait for the build to complete

6. **Run database migrations**:
   - After deployment, you'll need to run the Prisma migrations
   - In the Vercel dashboard, go to your project settings
   - Navigate to the 'Deployments' tab
   - Click on the three dots next to your latest deployment and select 'Redeploy'
   - Before redeploying, add the following build command:
     ```
     npx prisma migrate deploy && npm run build
     ```

Your Household Calculator application will now be deployed and accessible via the Vercel URL.


## DB migration

```
npx prisma migrate dev --name add_session_model
```