# Comentarios y Decisiones Técnicas

Hola, aca explico algunas decisiones que tomé durante el desarrollo de esta prueba.

## TypeORM en lugar de Prisma

Normalmente uso Prisma en mis proyectos, es el ORM con el que me siento más cómodo y el que más conozco. Pero para esta prueba quise salir de mi zona de confort y usar TypeORM. La verdad es que fue un buen reto porque TypeORM tiene un enfoque diferente, más orientado a decoradores y clases, mientras que Prisma es más declarativo con su schema.

## Sistema de Login

Aunque no estaba en los requerimientos, decidí agregar un sistema de autenticación con JWT. La razón es simple: en la mayoría de APIs reales necesitas proteger los endpoints, así que me pareció buena idea mostrar cómo lo haría.

Implementé un módulo de autenticación completo con:
- Login que genera un JWT
- Guard para proteger los endpoints de productos
- Estrategia de Passport para validar los tokens
- Un usuario admin por defecto que se crea automáticamente al iniciar la app

Los endpoints de productos están protegidos, así que primero jay que hacer login en `/auth/login` para obtener el token, y luego usarlo en el header `Authorization: Bearer <token>` para acceder a los endpoints de productos.

Las credenciales por defecto son:
- Email: admin@homepower.com
- Password: admin123

## Swagger para Documentación

Agregué Swagger porque me parece super útil para probar los endpoints sin tener que usar Postman o curl. Una vez que la app se levanta, podés ir a `http://localhost:3000/api/docs` y ahí tenés toda la documentación interactiva de la API.

Desde Swagger se puede:
- Ver todos los endpoints disponibles
- Probar cada endpoint directamente desde el navegador
- Ver los DTOs y sus validaciones
- Autenticarte con el botón "Authorize" usando el token JWT

Es mucho más práctico que andar copiando y pegando comandos curl, y además queda documentado para cualquier persona que quiera usar la API.

## Configuración de Terraform

La configuración de Terraform la basé en un proyecto que había hecho antes. Ya tenía experiencia configurando RDS y ECS en AWS, así que tomé como referencia esa estructura y la adapté para este proyecto.

Lo que hice fue:
- Crear el RDS con PostgreSQL
- Configurar ECS Fargate para correr los contenedores
- Agregar un Application Load Balancer para exponer la API
- Configurar Secrets Manager para guardar las credenciales de forma segura
- Agregar auto-scaling basado en CPU y memoria
- Configurar CloudWatch para logs y monitoreo

Una cosa que aprendí en proyectos anteriores es que es mejor tener todo separado por módulos, pero para esta prueba técnica lo dejé todo en archivos separados (rds.tf, ecs.tf, etc.) que es más fácil de entender.

## Otras Cosas

- Los tests unitarios están en el servicio de productos y en el de autenticación. Usé Jest que viene por defecto con NestJS.
- El manejo de excepciones lo hice con un filter global que formatea las respuestas de error de forma consistente.
- Las validaciones están en los DTOs usando class-validator, que es el estándar en NestJS.
- El Dockerfile está optimizado con multi-stage build para que la imagen final sea más liviana.

Bueno, eso es todo. Me gustó mucho realizar esta prueba, recordar cosas que llevaba tiempo sin usar y ver todo lo que se puede lograr.

