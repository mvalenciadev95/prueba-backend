# 📝 Prueba Técnica - Desarrollador Backend Semi-Senior

## ⚠️ Antes de comenzar

Por favor, **lee toda la prueba completa antes de empezar**. El tiempo estimado para completarla es de **2-3 horas**, pero puedes tomar hasta **24 horas** para entregarla. La entrega se realiza a través de un **Pull Request (PR)** en este repositorio.

## 🔥 Instrucciones Generales

1. **Haz un fork** de este repositorio en tu cuenta de GitHub.
2. Crea una nueva rama con tu nombre o un identificador único:
   ```bash
   git checkout -b tu-nombre
   ```
3. Desarrolla tu solución en la rama creada.
4. Una vez finalizado, sube tus cambios a tu repositorio y abre un **Pull Request (PR)** hacia este repositorio.
5. **Asegúrate de incluir una breve descripción en el PR** explicando tu enfoque y decisiones técnicas.
6. Puedes usar **IA o cualquier recurso** que consideres necesario, pero ten en cuenta que podrías ser requerido para sustentar tu solución.

## 📌 Requerimientos

### 1️⃣ Implementación de API en NestJS

- Crea un servicio en **NestJS** que exponga endpoints para manejar entidades en **PostgreSQL** usando el ORM de tu preferencia (TypeORM o Prisma).
- Debe incluir CRUD para una entidad llamada `Productos` con los siguientes campos:
  - `id` (UUID, PK)
  - `nombre` (string)
  - `precio` (decimal)
  - `stock` (entero)

### 2️⃣ Seguridad y Buenas Prácticas

- Implementa **validaciones** con DTOs en los endpoints.
- Manejo adecuado de **excepciones**.
- Configuración de variables de entorno con `.env`.

### 3️⃣ Pruebas Unitarias

- Escribe pruebas unitarias para al menos un servicio usando **Jest**.

### 4️⃣ Conocimientos en AWS (Opcional, suma puntos)

- Describe cómo desplegarías esta API en **AWS ECS + RDS**.
- Explica brevemente cómo manejarías secretos con **AWS Secrets Manager**.
- Opcionalmente, agrega un pequeño **Terraform** para crear el RDS.

### 5️⃣ CI/CD con GitHub Actions y Terraform (Opcional, suma puntos)

- Crea un workflow en **GitHub Actions** para ejecutar pruebas automáticamente en cada `push` o `PR`.
- Opcionalmente, agrega un paso en el pipeline para desplegar la API en AWS usando **Terraform**.

## ⏳ Tiempo Estimado

Queremos que tengas el tiempo suficiente para hacerlo bien, pero sin presionarte demasiado. Lo ideal es que puedas completarlo en unas **2-3 horas**, pero puedes tomar hasta **24 horas** para entregarlo.

## 📬 Entrega

- Haz un **Pull Request** con tu código.
- Asegúrate de que los endpoints sean funcionales.
- Si tienes comentarios o explicaciones, agrégalas en el `README.md` de tu fork.

---

¡Buena suerte y esperamos ver tu solución! 🚀
