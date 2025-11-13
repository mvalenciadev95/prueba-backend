# Terraform - Infraestructura AWS (RDS + ECS)

Este directorio contiene la configuración de Terraform para crear la infraestructura completa en AWS:
- **RDS PostgreSQL**: Base de datos administrada
- **ECS Fargate**: Contenedores para la API
- **Application Load Balancer**: Balanceador de carga
- **ECR**: Repositorio de imágenes Docker
- **Secrets Manager**: Gestión de secretos
- **CloudWatch**: Logs y monitoreo
- **Auto Scaling**: Escalado automático basado en CPU y memoria

## Requisitos

- Terraform >= 1.0
- AWS CLI configurado
- Credenciales de AWS con permisos adecuados
- VPC existente con subnets públicas y privadas

## Configuración

1. Crear un archivo `terraform.tfvars` con las siguientes variables:

```hcl
aws_region        = "us-east-1"
vpc_id            = "vpc-xxxxxxxx"
subnet_ids        = ["subnet-xxxxx1", "subnet-xxxxx2"]  # Subnets privadas para RDS
alb_subnet_ids    = ["subnet-xxxxx3", "subnet-xxxxx4"]  # Subnets públicas para ALB
ecs_subnet_ids    = ["subnet-xxxxx1", "subnet-xxxxx2"]  # Subnets privadas para ECS
allowed_cidr_blocks = ["10.0.0.0/16"]                    # CIDR de la VPC

db_instance_class = "db.t3.micro"
db_username       = "admin"
db_password       = "tu-password-seguro"  # Usar un password fuerte
jwt_secret        = "tu-jwt-secret-seguro" # Secret para JWT

environment       = "production"
ecs_cpu           = 512   # 0.5 vCPU
ecs_memory        = 1024  # 1 GB RAM
ecs_desired_count = 1
ecs_min_capacity  = 1
ecs_max_capacity  = 4
ecs_assign_public_ip = false  # true si no tienes NAT Gateway
```

2. Inicializar Terraform:

```bash
terraform init
```

3. Revisar el plan:

```bash
terraform plan
```

4. Aplicar la configuración:

```bash
terraform apply
```

## Outputs

Después de aplicar, Terraform mostrará:

### RDS
- `rds_endpoint`: Endpoint de la base de datos
- `rds_port`: Puerto de la base de datos
- `rds_database_name`: Nombre de la base de datos
- `secrets_manager_arn`: ARN del secreto en Secrets Manager

### ECS
- `ecr_repository_url`: URL del repositorio ECR (para hacer push de la imagen)
- `ecs_cluster_name`: Nombre del cluster ECS
- `ecs_service_name`: Nombre del servicio ECS

### ALB
- `alb_dns_name`: DNS del Application Load Balancer (URL pública de la API)
- `alb_arn`: ARN del ALB

### Secrets
- `jwt_secret_arn`: ARN del secreto JWT en Secrets Manager

## Despliegue de la Aplicación

Después de crear la infraestructura:

1. **Autenticarse en ECR:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

2. **Obtener la URL del repositorio:**
```bash
terraform output ecr_repository_url
```

3. **Construir y subir la imagen:**
```bash
ECR_URL=$(terraform output -raw ecr_repository_url)
docker build -t productos-api:latest .
docker tag productos-api:latest $ECR_URL:latest
docker push $ECR_URL:latest
```

4. **Forzar actualización del servicio ECS:**
```bash
CLUSTER=$(terraform output -raw ecs_cluster_name)
SERVICE=$(terraform output -raw ecs_service_name)
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region us-east-1
```

5. **Obtener la URL pública:**
```bash
terraform output alb_dns_name
```

La API estará disponible en: `http://$(terraform output -raw alb_dns_name)`

## Estructura de la Infraestructura

```
Internet
   │
   ▼
Application Load Balancer (ALB)
   │
   ▼
ECS Fargate Tasks (API)
   │
   ▼
RDS PostgreSQL (Base de Datos)
```

- **ALB**: Expone la API públicamente en HTTP (puerto 80)
- **ECS Tasks**: Corren en subnets privadas, accesibles solo desde el ALB
- **RDS**: Accesible solo desde las tareas ECS (security groups)
- **Secrets Manager**: Las credenciales se inyectan automáticamente en las tareas ECS

## Auto Scaling

El servicio ECS se escala automáticamente basado en:
- **CPU**: Escala cuando el uso promedio supera el 70%
- **Memoria**: Escala cuando el uso promedio supera el 80%

Rango: 1-4 tareas (configurable en `ecs_min_capacity` y `ecs_max_capacity`)

## Monitoreo

- **CloudWatch Logs**: Logs de la aplicación en `/ecs/productos-api`
- **CloudWatch Metrics**: Métricas de CPU, memoria, requests, etc.
- **RDS Monitoring**: Métricas de la base de datos

## Seguridad

- ✅ Contraseñas en Secrets Manager (no en código)
- ✅ RDS en subnets privadas
- ✅ ECS tasks en subnets privadas
- ✅ Security groups restrictivos
- ✅ Encriptación en tránsito y en reposo
- ✅ Imagen Docker ejecutándose como usuario no-root

## Destrucción

⚠️ **ADVERTENCIA**: Esto eliminará TODOS los recursos, incluyendo la base de datos.

```bash
terraform destroy
```

Para preservar la base de datos, establece `skip_final_snapshot = false` y crea un snapshot manual antes de destruir.

