output "vercel_project_id" {
  description = "The managed Vercel project ID."
  value       = vercel_project.app.id
}

output "redis_endpoint" {
  description = "Upstash Redis REST endpoint host."
  value       = upstash_redis_database.store.endpoint
}

output "cron_secret" {
  description = "Generated CRON_SECRET. Use: curl -H \"Authorization: Bearer <cron_secret>\" https://<domain>/api/refresh"
  value       = random_password.cron_secret.result
  sensitive   = true
}
