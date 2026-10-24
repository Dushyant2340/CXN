# CXN BioProfile

A bilingual Hindi/English biography platform starter under the CXN identity. This folder is deliberately separate from the existing CXN app at the repository root.

## Deploy this folder separately
In Cloudflare Pages, connect repository `Dushyant2340/CXN`, set the project root directory to `bioprofile`, leave the framework preset as None, leave build command blank, and use `.` as the output directory if required by the dashboard. The resulting site will be separate from the existing root app.

## Configure database
1. Create a Supabase project at https://supabase.com.
2. Run `schema.sql` in SQL Editor.
3. Copy the Project URL and public anon/publishable key.
4. Edit `index.html` and fill `CONFIG.SUPABASE_URL` and `CONFIG.SUPABASE_ANON_KEY`.
5. Never use a service_role or secret key in browser code.

## Admin workflow
- Read proposals in Supabase Table Editor → `submissions`.
- Verify every important claim against independent reliable sources.
- For approved biographies, create a row in `biographies` with `status = published`.
- Set `verified = true` only after sources have actually been checked.
- The starter has no public admin panel, email notification system, or working correction form. Review is manual in Supabase.

## Before accepting public submissions
Add anti-spam protection (such as CAPTCHA/Turnstile), monitoring, data-retention rules, a monitored correction/removal contact and a reviewed privacy policy. Test RLS. The anonymous submission form can attract spam. Avoid private details, unsupported allegations and copyrighted images without permission. Demo cards are fictional placeholders, not real biographies.
