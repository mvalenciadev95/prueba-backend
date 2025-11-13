terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_db_subnet_group" "main" {
  name       = "productos-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "Productos DB Subnet Group"
  }
}

resource "aws_security_group" "rds" {
  name        = "productos-rds-sg"
  description = "Security group for Productos RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Productos RDS Security Group"
  }
}

resource "aws_db_instance" "productos" {
  identifier             = "productos-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = "productos_db"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier  = "productos-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  deletion_protection       = var.deletion_protection

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
  monitoring_interval            = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn

  tags = {
    Name        = "Productos Database"
    Environment = var.environment
  }
}

resource "aws_iam_role" "rds_monitoring" {
  name = "productos-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

resource "aws_secretsmanager_secret" "rds_credentials" {
  name                    = "prod/rds/credentials"
  description             = "RDS credentials for Productos database"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = aws_secretsmanager_secret.rds_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = "postgres"
    host     = aws_db_instance.productos.address
    port     = aws_db_instance.productos.port
    dbname   = aws_db_instance.productos.db_name
  })
}

