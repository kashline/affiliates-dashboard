# affiliates-dashboard — Vercel infrastructure (Terraform)

Provisions the cloud dependencies for the storefront so they're reproducible:

- **Upstash Redis** (the "Vercel KV" store) — created directly in your Upstash
  account via the Upstash provider.
- **Vercel project** (optional to manage here — see _Existing project_ below).
- **Vercel environment variables** wired to the above: `ANTHROPIC_API_KEY`,
  `AMAZON_ASSOCIATE_TAG`, `CRON_SECRET` (auto-generated), `KV_REST_API_URL`,
  `KV_REST_API_TOKEN`, and optional `NEXT_PUBLIC_SITE_URL`.

> **Crons are not managed here.** The weekly schedule lives in
> [`../vercel.json`](../vercel.json); the Vercel Terraform provider has no cron
> resource. Terraform manages the env vars and the KV store the cron route
> depends on — the schedule itself ships with the app deployment.

## Prerequisites

- Terraform ≥ 1.7
- A **Vercel API token** (Account Settings → Tokens)
- An **Upstash account** + Management API key (Upstash console → Account →
  Management API): `upstash_email`, `upstash_api_key`
- Your **Anthropic API key** and **Amazon Associates tag**

## Usage

```bash
cd infra

# Supply secrets via env (recommended) …
export TF_VAR_vercel_api_token=...
export TF_VAR_upstash_email=you@example.com
export TF_VAR_upstash_api_key=...
export TF_VAR_anthropic_api_key=sk-ant-...
export TF_VAR_amazon_associate_tag=yourtag-20
# … or copy terraform.tfvars.example -> terraform.tfvars and fill it in.

terraform init
terraform plan
terraform apply
```

After apply, trigger the first refresh by hand (no need to wait for Monday):

```bash
terraform output -raw cron_secret   # the generated CRON_SECRET
curl -H "Authorization: Bearer $(terraform output -raw cron_secret)" \
  https://<your-domain>/api/refresh
```

## Existing project

If the Vercel project already exists (created via the dashboard / git import),
import it before the first apply so Terraform adopts it instead of trying to
create a duplicate:

```bash
terraform import vercel_project.app <project_id>   # find the ID in Vercel → Project Settings
```

If you'd rather not manage the project lifecycle in Terraform at all, delete
`vercel_project.app` from `main.tf` and replace `vercel_project.app.id` in the
env-var resources with a hardcoded project ID variable.

## State & secrets

State is **local** by default and contains secret values (Upstash token, env
var values), so `*.tfstate*` and `*.tfvars` are gitignored. For team use, add a
backend block in `versions.tf` (e.g. the S3 backend used by
`ainews-infrastructure`) and re-run `terraform init`. Commit
`.terraform.lock.hcl`.
