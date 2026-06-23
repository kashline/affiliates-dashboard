# Credentials are supplied as variables — pass them via TF_VAR_* environment
# variables (recommended, keeps secrets out of files) or a gitignored
# terraform.tfvars. See README.md.

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team
}

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}
