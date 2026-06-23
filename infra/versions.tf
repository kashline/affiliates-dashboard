terraform {
  required_version = ">= 1.7.0"

  # Local state by default. State contains secrets (Upstash token, env var
  # values), so the state file is gitignored. To share state across a team,
  # add a backend block here (e.g. the same S3 backend used by
  # ainews-infrastructure) and re-run `terraform init`.

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 4.8"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.5"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}
