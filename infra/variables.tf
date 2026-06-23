# ─── Provider credentials ────────────────────────────────────────────────────

variable "vercel_api_token" {
  description = "Vercel API token (Account Settings → Tokens). Or set VERCEL_API_TOKEN and remove api_token from providers.tf."
  type        = string
  sensitive   = true
}

variable "vercel_team" {
  description = "Vercel team slug or ID. Leave null for a personal account."
  type        = string
  default     = null
  nullable    = true
}

variable "upstash_email" {
  description = "Upstash account email (Upstash console → Account → Management API)."
  type        = string
}

variable "upstash_api_key" {
  description = "Upstash management API key."
  type        = string
  sensitive   = true
}

# ─── Project ─────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Vercel project name. Must match the existing project if importing."
  type        = string
  default     = "affiliates-dashboard"
}

variable "github_repo" {
  description = "GitHub repo to connect for auto-deploys, as \"owner/repo\". Null = don't manage the git connection here."
  type        = string
  default     = null
  nullable    = true
}

variable "production_branch" {
  description = "Branch that triggers production deploys (e.g. \"main\"). Null = repo default."
  type        = string
  default     = null
  nullable    = true
}

# ─── Upstash Redis ───────────────────────────────────────────────────────────

variable "upstash_region" {
  description = "Redis region: a single region like us-east-1 / eu-west-1, or \"global\"."
  type        = string
  default     = "us-east-1"
}

variable "upstash_primary_region" {
  description = "Primary region — required only when upstash_region is \"global\"."
  type        = string
  default     = null
  nullable    = true
}

# ─── Application env var values ───────────────────────────────────────────────

variable "anthropic_api_key" {
  description = "Anthropic API key used by the weekly curation job."
  type        = string
  sensitive   = true
}

variable "amazon_associate_tag" {
  description = "Amazon Associates tracking tag appended to outbound links (e.g. mytag-20)."
  type        = string
  default     = ""
}

variable "site_url" {
  description = "Canonical production URL for absolute OG/metadata (NEXT_PUBLIC_SITE_URL). Null = skip."
  type        = string
  default     = null
  nullable    = true
}
