# Serverless Challenge - AWS Lambda + CDK + Cognito

Este reposotirio contiene un API REST utilizando tecnologías serverless en AWS. Permite fusionar datos de dos APIs públicas (Pokémon y Star Wars), almacenar resultados e interactuar con una base de datos DynamoDB a través de endpoints protegidos por autenticación Cognito.

---

## `Configuración`

1. Clonar el repositorio

2. Instalar dependencias `npm i`

3. Crear un archivo `.env` basado en el `.env.template`

4. Ejecutar ``cdk bootstrap`` para crear la plantilla cdk en Amazon CloudFormation

5. Ejecutar `npm run build` y luego `cdk deploy` para subir nuestro proyecto a AWS.

6. ``En la terminal, le saldrán 2 url: uno le dara acceso al UI de cognito para autenticación y la segunda url es la API Rest publicada. Solo la segunda url debe estar configurada en el .env según el .env.template``

---

## 🚀 ``Tecnologías Utilizadas``

- AWS Lambda

- AWS API Gateway
- AWS DynamoDB
- AWS Cognito
- AWS CDK v2 (TypeScript)
- TypeScript, Axios, Jest

---

## ``Endpoints Disponibles``

### 🔐 Autenticación

El sistema utiliza **AWS Cognito** con una UI alojada para registro e inicio de sesión:

📥 **[Iniciar sesión en Cognito](https://serverless-app-auth.auth.us-east-1.amazoncognito.com/login?client_id=TU_CLIENT_ID&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=https://example/success)**  
📌 Una vez iniciado sesión, lo redireccionara a otra pagina que esta de ejemplo. Se debera copiar toda la url, y luego tomar solo el id_token para usarlo con el Bearer `id_token`
📌 *Reemplazar `TU_CLIENT_ID` con el client real si no es automático*

---

### `GET /fusionar`

Fusiona personajes de Star Wars con Pokémons (uno a uno) y devuelve el resultado.

- Protegido por JWT Cognito
- Implementa caché de 30 minutos con DynamoDB
- Almacena el resultado en el historial

📥 **Requiere token Bearer en header Authorization**

---

### `POST /almacenar`

Guarda datos personalizados (nombre, email, mensaje).

- Protegido por JWT Cognito
- Guarda la data en una tabla DynamoDB separada

Body esperado:

```json
{
  "user": "DavidSD",
  "post": "Mi primer post"
}
```
📥 **Requiere token Bearer en header Authorization**

---

### `GET /historial`

Devuelve el historial completo de combinaciones realizadas (ordenadas por timestamp).

- Protegido por JWT Cognito
- Incluye paginación y orden descendente

📥 **Requiere token Bearer en header Authorization**

---

### 🚦 `Rate Limiting`

API Gateway utiliza un Usage Plan con límites:

- rateLimit: 5 req/segundo

- burstLimit: 10

`Esto evita abuso sobre los endpoints que consumen APIs externas`

---

### 🧪 `Testing`

- ✅ Pruebas unitarias con Jest (/combine)

- ✅ Pruebas de integración con Axios para /record y /store

- ✅ Soporte para .env con configuración de BASE_URL y ACCESS_TOKEN

- 🚨Tener en cuenta que, para que funcionen las pruebas, se debe configurar los .env como se detalla al principio.

```
npm run test
```
---

### `📘Documentación Swagger / OpenAPI`

En el root del proyecto existe un archivo `swagger.json` la cual contiene documentado todo los endpoints de la API Rest. Se podrá observar pegando el swagger.json en la siguiente dirección web: https://editor.swagger.io/

---
### `Referente al costo`

- Este proyecto se mantiene dentro de la capa gratuita de AWS.
- No se uso recursos con costo adicional (ECR, S3, etc.)
- Las tablas en DynamoDB tienen una politica de destrucción, por lo que cuando se ejecute `cdk destroy`, se eliminara sin ningún inconveniente.
