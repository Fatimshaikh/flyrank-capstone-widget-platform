# Evidence — Definition of Done Proof

One pasted proof per checklist item from the capstone brief Definition of Done.

## Authentication

### Register creates a user with a bcrypt-hashed password
docker exec -it widget_platform_db psql -U widget_admin -d widget_platform -c "SELECT id, email, password_hash FROM users;"
Result: password_hash begins with $2b$10$ - confirms bcrypt hashing, never plain text.

### Duplicate registration is rejected with 409
curl -X POST http://localhost:3000/auth/register -d email/password already used
Result: {"error":"An account with this email already exists"}

### Correct login returns 200 plus JWT
curl -X POST http://localhost:3000/auth/login with correct credentials
Result: 200 with user object and signed JWT token returned

### Wrong password returns 401 with generic message
curl -X POST http://localhost:3000/auth/login with wrong password
Result: {"error":"Invalid email or password"}

### Invalid input rejected with 400 and Zod validation details
curl -X POST http://localhost:3000/auth/register with invalid email and short password
Result: 400 with field-level validation errors, never a 500

## Auth Middleware (JWT verification)

### Request with no token is rejected
curl http://localhost:3000/whoami (no Authorization header)
Result: 401 {"error":"Missing or malformed Authorization header"}

### Request with an invalid/garbage token is rejected
curl http://localhost:3000/whoami -H "Authorization: Bearer garbage.fake.token"
Result: 401 {"error":"Invalid or expired token"}

### Request with a valid token is allowed through, identity correctly attached
curl http://localhost:3000/whoami -H "Authorization: Bearer <real token>"
Result: 200 {"message":"You are authenticated","user":{"id":1,"email":"fatima@example.com"}}

## Widget Management (Multi-Tenant CRUD)

### Authenticated user can create a widget
curl -X POST http://localhost:3000/widgets with valid JWT and widget payload
Result: 201, widget created with correct tenant_id from the JWT

### Widget list is scoped to the authenticated tenant
curl http://localhost:3000/widgets with valid JWT
Result: 200, array containing only that tenant's widgets

### Request without a token is rejected
curl http://localhost:3000/widgets (no Authorization header)
Result: 401 {"error":"Missing or malformed Authorization header"}

### Tenant isolation proven: Tenant B cannot access Tenant A's widget
Created second user (tenant_id 34), attempted to fetch tenant 1's widget (id=1) using tenant 34's token
Result: 404 {"error":"Widget not found"} - not even existence is leaked

### Tenant B's own widget list correctly empty
curl http://localhost:3000/widgets with tenant 34's token
Result: 200, []
