locals {
  # Secrets target production + preview only. (Vercel requires sensitive=false
  # for any variable targeting "development".)
  secret_targets = ["production", "preview"]
  all_targets    = ["production", "preview", "development"]
}

# ─── CRON secret (auto-generated, surfaced as an output) ─────────────────────
resource "random_password" "cron_secret" {
  length  = 40
  special = false
}

# ─── Upstash Redis ("Vercel KV") ─────────────────────────────────────────────
resource "upstash_redis_database" "store" {
  database_name  = "${var.project_name}-storefront"
  region         = var.upstash_region
  primary_region = var.upstash_primary_region
  tls            = true
}

# ─── Vercel project ──────────────────────────────────────────────────────────
# If the project already exists (created via the Vercel UI / git import), import
# it first: `terraform import vercel_project.app <project_id>` — see README.
resource "vercel_project" "app" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = var.github_repo == null ? null : {
    type              = "github"
    repo              = var.github_repo
    production_branch = var.production_branch
  }
}

# ─── Environment variables ───────────────────────────────────────────────────
# The schedule itself lives in vercel.json (the Vercel provider has no cron
# resource); these vars are what the cron route and the storefront read.

resource "vercel_project_environment_variable" "anthropic_api_key" {
  project_id = vercel_project.app.id
  key        = "ANTHROPIC_API_KEY"
  value      = var.anthropic_api_key
  target     = local.secret_targets
  sensitive  = true
  comment    = "Claude API key for the weekly curation job"
}

resource "vercel_project_environment_variable" "cron_secret" {
  project_id = vercel_project.app.id
  key        = "CRON_SECRET"
  value      = random_password.cron_secret.result
  target     = local.secret_targets
  sensitive  = true
  comment    = "Bearer token guarding GET /api/refresh"
}

resource "vercel_project_environment_variable" "kv_url" {
  project_id = vercel_project.app.id
  key        = "KV_REST_API_URL"
  value      = "https://${upstash_redis_database.store.endpoint}"
  target     = local.secret_targets
  sensitive  = false
  comment    = "Upstash Redis REST URL"
}

resource "vercel_project_environment_variable" "kv_token" {
  project_id = vercel_project.app.id
  key        = "KV_REST_API_TOKEN"
  value      = upstash_redis_database.store.rest_token
  target     = local.secret_targets
  sensitive  = true
  comment    = "Upstash Redis REST token"
}

resource "vercel_project_environment_variable" "amazon_tag" {
  project_id = vercel_project.app.id
  key        = "AMAZON_ASSOCIATE_TAG"
  value      = var.amazon_associate_tag
  target     = local.all_targets
  sensitive  = false
  comment    = "Amazon Associates tag appended to outbound links"
}

resource "vercel_project_environment_variable" "site_url" {
  count      = var.site_url == null ? 0 : 1
  project_id = vercel_project.app.id
  key        = "NEXT_PUBLIC_SITE_URL"
  value      = var.site_url
  target     = local.all_targets
  sensitive  = false
  comment    = "Canonical site URL for absolute OG/metadata"
}
