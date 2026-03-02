## Farmhouse API

NestJS + TypeORM + Prisma + Postgres backend for managing farms, users, photography and decorations with RBAC.

### Roles

- **Owner**: Full access; can create/update/delete farms, photography, decorations, and **create/manage users**.
- **Admin**: Similar to Owner; can create/manage users and all domain entities.
- **User**: Read-only for farms, photography and decorations.

### Auth

- **Login**
  - **POST** `http://localhost:3000/api/auth/login`
  - Body:
    ```json
    {
      "email": "owner@farmhouse.local",
      "password": "owner123"
    }
    ```
  - Returns: `{ "accessToken": "JWT_TOKEN" }`

- **Seeded Owner**
  - On first startup, the app seeds a default Owner (if none exists):
    - Email: `owner@farmhouse.local`
    - Password: `owner123`
  - Use this account to log in and create more users.

### Users

- **Create user** (Owner/Admin)
  - **POST** `/api/users`
  - Headers: `Authorization: Bearer <JWT>`
  - Body:
    ```json
    {
      "email": "admin@example.com",
      "name": "Admin 1",
      "password": "secret123",
      "role": "Admin"
    }
    ```
- **List users** (Owner/Admin): `GET /api/users`
- **Get user** (Owner/Admin): `GET /api/users/:id`
- **Update user** (Owner/Admin): `PATCH /api/users/:id`
- **Delete user** (Owner/Admin): `DELETE /api/users/:id`

### Farms

- **Create farm** (Owner/Admin)
  - **POST** `/api/farms`
  - Body:
    ```json
    {
      "name": "Green Valley Farm",
      "location": "Near City",
      "description": "Nice farmhouse",
      "ownerId": "<OWNER_USER_ID>"
    }
    ```
- **List farms** (Owner/Admin/User): `GET /api/farms`
- **Get farm** (Owner/Admin/User): `GET /api/farms/:id`
- **Update farm** (Owner/Admin): `PATCH /api/farms/:id`
- **Delete farm** (Owner/Admin): `DELETE /api/farms/:id`

### Photography

- **Create photo** (Owner/Admin): `POST /api/photography`
- **List photos** (Owner/Admin/User): `GET /api/photography`
- **Get photo** (Owner/Admin/User): `GET /api/photography/:id`
- **Update photo** (Owner/Admin): `PATCH /api/photography/:id`
- **Delete photo** (Owner/Admin): `DELETE /api/photography/:id`

### Decorations

- **Create decoration** (Owner/Admin): `POST /api/decorations`
- **List decorations** (Owner/Admin/User): `GET /api/decorations`
- **Get decoration** (Owner/Admin/User): `GET /api/decorations/:id`
- **Update decoration** (Owner/Admin): `PATCH /api/decorations/:id`
- **Delete decoration** (Owner/Admin): `DELETE /api/decorations/:id`

### Running locally

1. Install dependencies:
   ```bash
   cd api
   npm install
   ```
2. Ensure Postgres is running and `.env` is configured.
3. Optionally run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```

