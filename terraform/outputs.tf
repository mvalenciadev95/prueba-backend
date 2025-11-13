output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.productos.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.productos.port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.productos.db_name
}

output "secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.rds_credentials.arn
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.productos_api.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.productos.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.productos_api.name
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.productos.dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.productos.arn
}

output "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

