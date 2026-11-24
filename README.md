# TaskNest

TaskNest is a private task manager. Sign up with your email and password, then create, edit, complete, filter, and delete your tasks. Each task has a title, an optional description, and a status of **Backlog**, **To do**, **Ongoing**, or **Done**. Choose a status when creating or editing a task. New tasks default to **To do**.

**Stack** · React, Vite, and CSS for the UI. Supabase Auth and hosted Postgres for accounts and tasks. The app is ready to deploy on Vercel.

## Run locally

1. Install Node.js 22.12 or later and run `npm ci`.
2. Create a [Supabase project](https://database.new). In its SQL Editor, run [Create tasks](supabase/migrations/202611240001_create_tasks.sql) and then [Add task statuses](supabase/migrations/202611240002_add_task_statuses.sql). If your project already has the original TaskNest table, run only the second migration.
3. Keep the Email provider and new sign-ups enabled in Supabase Auth. For the assignment demo, turn off **Confirm email** so reviewers can create an account immediately. With confirmation enabled, configure custom SMTP to deliver verification links to reviewers.
4. Copy [.env.example](.env.example) to `.env.local` and fill in the values from your Supabase project's Connect dialog.
5. Run `npm run dev` and open the local URL printed by Vite.

| Environment variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | The Supabase project URL, such as `https://your-project.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The project's browser-safe publishable API key |

Vite includes these values in the browser bundle. Use the publishable key, and keep the database password and Supabase secret or service-role keys out of the app.

## Deploy to Vercel

Import the GitHub repository into Vercel and select the **Vite** framework preset. Add both environment variables to the production environment before deploying. Vercel runs `npm run build` and publishes `dist`.

In Supabase **Authentication → URL Configuration**, set **Site URL** to your production app URL. Signup confirmation emails use this destination even when signup starts on localhost. If a link expires, open the app and attempt to sign in to request a new confirmation email.

After deploying, create two test accounts. With the first account, create, edit, and complete a task, then reload to verify it persists. Switch to the second account and confirm it has its own task list. Return to the first account, delete the task, and sign out.

## Task privacy

The database assigns new tasks to the signed-in user by default. Row Level Security checks ownership for reads, inserts, updates, and deletes. The frontend renders the dashboard only when there is an active session.

## What I’d do next

Add due dates for upcoming tasks. Set up email delivery so users can verify their accounts and reset forgotten passwords. Add an automated smoke test against a dedicated Supabase project.
