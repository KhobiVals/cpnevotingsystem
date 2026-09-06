# DESAG Election Management & E-Voting System

Official Online Voting Platform for the **Distance Education Students' Association of Ghana (DESAG)**.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **TypeScript**, and **Supabase (PostgreSQL, RLS, Auth)**.

---

## Key Features

1. **Voter Security & Anonymity**
   - Cryptographically decoupled secret ballot submission.
   - SMS PIN / One-Time Password credential delivery via **Vistal SMS API**.
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
- **SMS Gateway:** Vistal SMS API
- **Deployment:** Vercel + GitHub Integration

---

## Environment Variables Setup

When deploying to Vercel (or local environment), set the following environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vistal SMS API Integration
VISTAL_SMS_API_KEY=your-vistal-api-key
VISTAL_SMS_SENDER_ID=DESAG

# Voter Session Encryption
VOTER_SESSION_SECRET=min-32-character-secret-key-for-jwt-signing
```

---

## Supabase Database Initialization

1. Open your **Supabase Dashboard** SQL Editor.
2. Run `supabase/migrations/001_initial_schema.sql` to construct tables, enums, triggers, and the `submit_vote` RPC function.
3. Run `supabase/migrations/002_rls_policies.sql` to enforce Row Level Security rules.
4. (Optional) Run `supabase/seed.sql` to populate sample notification templates and initial admin profile data.

---

## Deployment to GitHub & Vercel

1. **Commit and Push to GitHub:**
   ```bash
   git add .
   git commit -m "Complete DESAG Election Management System implementation"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Import the GitHub repository into your Vercel dashboard.
   - Add all environment variables listed above in **Project Settings > Environment Variables**.
   - Trigger deployment.

---

## System Architecture & Portals

- `/` &mdash; Public Landing & Electoral Portal Directory
- `/vote` &mdash; Voter Login & Authentication
- `/vote/[electionId]/ballot` &mdash; Interactive Secret Ballot Voting Interface
- `/vote/[electionId]/confirmed` &mdash; Post-vote Cryptographic Receipt
- `/results` &mdash; Certified Public Results Archive
- `/admin/login` &mdash; Electoral Commission Login
- `/admin/dashboard` &mdash; Admin Monitoring & Control Panel
- `/admin/elections/[id]` &mdash; Election Setup, Positions, Candidates, Voters & Live Results
- `/agent/login` &mdash; Polling Agent Login
- `/agent/review` &mdash; Polling Agent Endorsement & Objection Portal
- `/returning-officer/declare/[id]` &mdash; Official Declaration Certification
