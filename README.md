# MC22 FINAL Shared Dashboard

## Included
- `login.html` — leader login
- `index.html` — Dashboard
- `performance.html` — shared Performance Table
- Upload agent photos directly from a computer
- Add / edit / delete agents
- Shared online database
- Shared photo storage
- CSV export
- GitHub Pages compatible

## IMPORTANT
GitHub Pages is only the website host. The shared database and photos use Supabase.

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase_setup.sql`.
3. In Storage, create a PUBLIC bucket named `agent-photos`.
4. In Authentication > Providers, enable Email.
5. Create leader users in Authentication > Users.
6. Copy Project URL and anon/public key from Supabase Project Settings > API.
7. Put them into `config.js`.
8. Upload the files to GitHub.
9. Enable GitHub Pages.
10. Share the GitHub Pages URL with leaders.

### Security
Do NOT put the Supabase `service_role` key in `config.js`. Only use the `anon`/public key.

### Photo upload
Leaders can choose JPG, PNG, or WebP files up to 5 MB. Photos are uploaded to Supabase Storage and the public image URL is saved with the agent.

### Permissions
Any authenticated leader can currently add, edit and delete agents. If you later want Admin vs Leader permissions, add a role column and policies.
