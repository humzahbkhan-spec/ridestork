# RideStork — Supabase Setup Guide

## 1. Create Supabase Project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.

## 2. Run the Schema

Open the **SQL Editor** in your Supabase dashboard and paste the contents of `supabase/schema.sql`. Run it.

Then run `supabase/verify.sql` to confirm everything was created correctly.

## 3. Environment Variables

Add these to `.env.local` for local dev, and to Vercel for production:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these in: **Supabase Dashboard → Settings → API**

The existing Redis/Upstash vars in `.env.development.local` remain unchanged.

## 4. Auth Configuration

### Site URL

**Dashboard → Auth → URL Configuration → Site URL**

| Environment | Value |
|-------------|-------|
| Local dev   | `http://localhost:3000` |
| Production  | `https://your-domain.vercel.app` |

### Redirect URLs

**Dashboard → Auth → URL Configuration → Redirect URLs**

Add all of these:

```
http://localhost:3000/auth/callback
https://your-domain.vercel.app/auth/callback
```

If you have a custom domain, add that too:

```
https://ridestork.com/auth/callback
```

### Magic Link Settings

**Dashboard → Auth → Email → Email Auth**

- Enable "Email" provider: **ON**
- Enable "Confirm email": **ON** (this is the magic link flow)
- Magic link / OTP expiry: **3600** seconds (1 hour, default is fine)

### Register the Auth Hook (stanford.edu enforcement)

**Dashboard → Auth → Hooks → Before User Created**

1. Toggle **ON**
2. Select **Postgres Function**
3. Schema: `public`
4. Function: `enforce_stanford_domain`
5. Save

This blocks any non-`@stanford.edu` signup at the auth layer. Without this step, domain enforcement only happens in the API routes (bypassable).

## 5. Verify Everything

1. Run `supabase/verify.sql` in the SQL Editor — all queries should return results
2. Check the auth hook is registered (step 4 above)
3. Try signing up with a non-stanford.edu email — should be rejected
4. Try signing up with a stanford.edu email — should receive magic link

## 6. Auth Flow Summary

```
User enters email in AuthGate
  → Frontend checks @stanford.edu (UX only)
  → supabase.auth.signInWithOtp({ email })
  → Supabase Auth runs enforce_stanford_domain hook
    → Non-stanford.edu? Rejected.
    → stanford.edu? Magic link email sent.
  → User clicks link in email
  → Browser opens /auth/callback?code=...
  → route.js exchanges code for session
  → Redirect to / with active session
  → middleware.js refreshes session on each request
```

## 7. Local Development

```bash
# Install dependencies
npm install

# Add env vars
cp .env.local.example .env.local  # then fill in values

# Run dev server
npm run dev
```

The app runs at `http://localhost:3000`. Make sure your Supabase Site URL is set to `http://localhost:3000` during local dev.

## 8. Production Deployment

1. Push to GitHub
2. Deploy via Vercel
3. Add env vars in Vercel dashboard
4. Update Supabase Site URL to your production URL
5. Add production redirect URL to Supabase
6. Test the full auth flow end-to-end
