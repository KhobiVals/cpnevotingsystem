# DESAG Election Management & E-Voting System

Official Online Voting Platform for the **Distance Education Students' Association of Ghana (DESAG)**.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **TypeScript**, and **Supabase (PostgreSQL, RLS, Auth)**.

---

## Key Features

1. **Voter Security & Anonymity**
   - Cryptographically decoupled secret ballot submission.
   - SMS PIN / One-Time Password credential delivery via **BMS Africa SMS API** (`https://app.bms.africa`).
   - Voter session isolation using HTTP-only JWT cookies.

2. **Candidate Polling Agent Portal**
   - Designated candidate agents review real-time positional tallies.
   - Formal objection filing system with category tagging (tally discrepancy, procedural violation, etc.).

3. **Returning Officer Certification**
   - Pre-declaration audit checklist verifying agent endorsements and unresolved objections.
   - Digital declaration certificate signing and immediate public release.

4. **Public Certified Results Archive**
   - High-fidelity visual breakdown of election outcomes per executive office.
   - Turnout analytics and official Returning Officer statement display.

5. **Electoral Commission Admin Control Panel**
   - Election lifecycle management (`draft` &rarr; `scheduled` &rarr; `open` &rarr; `closed` &rarr; `under_review` &rarr; `awaiting_declaration` &rarr; `declared`).
   - Position & Candidate nomination management.
   - Bulk voter roster import from Excel (`.xlsx`, `.xls`) & CSV files.
   - One-click bulk SMS credential dispatch.
   - Live result snapshot computation and audit trail logging.

---

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL with RLS policies, RPC functions, Auth)
- **SMS Gateway:** BMS Africa SMS API (`https://app.bms.africa`)
- **Deployment:** Vercel + GitHub Integration

---

## Environment Variables Setup

When deploying to Vercel (or local environment), set the following environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# BMS Africa SMS API Integration (https://app.bms.africa)
BMS_AFRICA_SMS_API_KEY=your-bms-africa-api-key
SMS_SENDER_ID=DESAG CENTRAL

# Voter Session Encryption
VOTER_SESSION_SECRET=min-32-character-secret-key-for-jwt-signing
```

---

## Supabase Step-by-Step Setup Guide

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project** and choose a name (e.g. `desag-voting`).
3. Set your Database Password and select your region.

### 2. Run Database Migrations
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Copy the full content of [`supabase/migrations/001_initial_schema.sql`](file:///h:/APPS/cpnevotingsystem/supabase/migrations/001_initial_schema.sql) and paste it into the SQL editor, then click **Run**.
4. Create another query, copy [`supabase/migrations/002_rls_policies.sql`](file:///h:/APPS/cpnevotingsystem/supabase/migrations/002_rls_policies.sql), paste and click **Run**.
5. (Optional) Run [`supabase/seed.sql`](file:///h:/APPS/cpnevotingsystem/supabase/seed.sql) to insert initial notification templates and admin profiles.

### 3. Copy API Keys to Vercel
From **Project Settings &gt; API**:
- Copy **Project URL** &rarr; `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** &rarr; `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role key** &rarr; `SUPABASE_SERVICE_ROLE_KEY`

---

## BMS Africa SMS API Setup Guide

1. Log into your **BMS Africa Dashboard** at [https://app.bms.africa/dashboard/sms/overview](https://app.bms.africa/dashboard/sms/overview).
2. Go to **API &amp; Integrations / API Keys** and generate an API Key.
3. Add `BMS_AFRICA_SMS_API_KEY` to your Vercel Environment Variables.
4. Set `SMS_SENDER_ID` to your approved Sender ID (e.g. `DESAG CENTRAL`).

---

## Deployment to GitHub & Vercel

```bash
git add .
git commit -m "Update BMS Africa SMS API integration and Supabase documentation"
git push origin main
```
