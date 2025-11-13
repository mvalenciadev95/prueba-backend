# Despliegue en AWS usando ECS y RDS

## Por qué ECS y RDS

La idea es correr la API en contenedores y tener una base de datos administrada. ECS (con Fargate) me permite subir mi app sin preocuparme por servidores, y RDS me da PostgreSQL sin tener que instalar nada manualmente. Básicamente, AWS se encarga del sistema operativo, parches, backups, etc., y yo solo pienso en el codigo.

## Base de datos en RDS

Creo un RDS PostgreSQL pequeño para ambiente de desarrollo (db.t3.micro). En producción sería algo más grande.

Datos clave:
- PostgreSQL como motor
- Instancia pequeña
- 20 GB de almacenamiento
- Backups automáticos activados

La ventaja es que no tengo que manejar la DB yo mismo ni instalar nada. Solo la apunto desde mi aplicación.

## ECS con Fargate

La API corre en ECS usando Fargate. Esto evita administrar máquinas o EC2. Yo solo defino cuánta CPU y memoria necesita la app y listo.

Usaría:
- 0.5 vCPU
- 1 GB RAM
- Auto-scaling si la carga aumenta

Para exponer la API uso un Application Load Balancer, que distribuye el tráfico entre las tareas del ECS.

## Secrets Manager

No quiero meter contraseñas o datos sensibles en variables de entorno directamente. En su lugar, los guardo en AWS Secrets Manager. Aquí guardaría:
- Usuario y contraseña de PostgreSQL
- Endpoint de la DB
- Otros secretos necesarios

La aplicación los obtiene en tiempo de ejecución y así evito subir secretos al repo o al contenedor.

Algo así sería el código para obtener los secretos:

```ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: 'prod/rds/credentials' })
);
const secret = JSON.parse(response.SecretString);

const dbConfig = {
  host: secret.host,
  port: secret.port,
  username: secret.username,
  password: secret.password,
  database: secret.dbname,
};
```

## Terraform

Agregué Terraform al proyecto para crear el RDS y el Secrets Manager. Está en `terraform/README.md`.

Básicamente crea:
- El RDS PostgreSQL
- Los Security Groups
- El secreto en Secrets Manager con las credenciales
- Los Subnet Groups y toda la configuración de red

## Variables de entorno en ECS

En la Task Definition de ECS pondría algunas variables normales y otras que vengan directamente desde Secrets Manager. Así separo bien lo que es público de lo que es secreto.

## Flujo de despliegue

Más o menos así sería el proceso:

1. Construyo la imagen Docker:
   ```bash
   docker build -t productos-api:latest .
   ```

2. Creo el repositorio en ECR (si no existe ya):
   ```bash
   aws ecr create-repository --repository-name productos-api --region us-east-1
   ```

3. Me autentico en ECR y subo la imagen:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag productos-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/productos-api:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/productos-api:latest
   ```

4. Actualizo el servicio ECS para que use la nueva imagen

5. ECS levanta la nueva tarea con la imagen nueva

6. ECS hace health checks para ver que el contenedor responda bien (tipo `/health` o algo así)

7. Si todo está bien, la nueva tarea queda activa y mata la antigua

8. Si algo falla, ECS hace rollback solo a la versión anterior

Así puedo actualizar la API sin tumbar todo y sin hacerlo todo a mano.

## Configuración de ECS

Para la Task Definition, configuraría algo así:

- La imagen desde ECR (algo como `123456789.dkr.ecr.us-east-1.amazonaws.com/productos-api:latest`)
- CPU: 512 (0.5 vCPU)
- Memoria: 1024 MB (1 GB)
- Puerto 3000 mapeado al contenedor
- Variables de entorno normales:
  - `NODE_ENV=production`
  - `AWS_REGION=us-east-1`
  - `PORT=3000`
- Los secrets desde Secrets Manager:
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` desde `prod/rds/credentials`

Para el ALB (Application Load Balancer):

- Target Group que apunte a las tareas ECS en el puerto 3000
- Health check en GET `/health` cada 30 segundos
- Listener en puerto 80/443
- Security Group que permita HTTP/HTTPS desde internet

## Seguridad

Intento mantener lo más sencillo:

- Nada de contraseñas en texto plano  
- Secrets Manager para lo sensible  
- Todo corre dentro de una VPC privada  
- Encriptación en tránsito y en reposo  
- Solo se deja pasar el tráfico necesario entre servicios  

## Monitoreo

CloudWatch guarda los logs y métricas. Con eso puedo ver:

- Métricas de ECS: CPU y memoria de las tareas, cuántas están corriendo, el estado del servicio, etc.
- Logs de la API: todo lo que sale por stdout/stderr, requests, errores, lo que sea
- Métricas de RDS: CPU, memoria, almacenamiento, conexiones activas, latencia de queries
- Alarmas: si la CPU pasa del 80% por más de 5 minutos, si la memoria está al 90%, si hay muchos errores 5xx, si las tareas fallan los health checks

Con esto puedo detectar problemas rápido y hacer algo antes de que se ponga feo.