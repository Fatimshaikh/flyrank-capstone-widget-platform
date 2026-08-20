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

## Widget Delivery (Caching + Embed Snippet)

### Embed snippet generated per widget
GET /widgets/1 returns embed_snippet field with a script tag pointing to widget.v1.js?id=1

### Public config endpoint serves with short cache headers
curl -i http://localhost:3000/widgets/1/config
Result: 200, Cache-Control: public, max-age=60

### Widget JS bundle served as versioned asset with long cache headers
curl -i http://localhost:3000/widget.v1.js
Result: 200, Cache-Control: public, max-age=31536000, immutable

## Cross-Origin Widget Rendering (CORS)

### Widget renders successfully on a second-origin test page
Served public-test-site/index.html on http://localhost:5500 (separate origin from API on :3000)
Before CORS fix: browser blocked fetch with "No Access-Control-Allow-Origin header present"
After adding cors middleware scoped to public routes (config + widget bundle): widget rendered correctly
Confirms: public widget-serving routes explicitly allow cross-origin requests, while
authenticated owner routes remain same-origin only by default (not covered by publicCors).

## Public Submission Endpoint

### Cross-origin submission from second-origin test page succeeds
Submitted form on http://localhost:5500 (widget page), stored via POST http://localhost:3000/submissions
Result: "Thank you! Your submission was received." + [EMAIL] Confirmation sent logged server-side

### Honeypot spam detection works, bot still gets a generic success response
curl -X POST /submissions with website field filled (simulating a bot)
Result: {"success":true,"id":2,"spam":true}, and DB confirms honeypot_triggered = true for that row

### Email/notification failure does not block a successful submission
Forced FORCE_EMAIL_FAILURE=true, then submitted a valid form
Result: {"success":true,"id":5,"spam":false} - submission still succeeded
Server log: "[EMAIL] Failed to send confirmation (non-critical): Simulated email provider outage"
Confirms: non-critical side effect failure never breaks the main submission path

## Rate Limiting

### Burst of 12 rapid submissions: first 10 succeed, remaining get 429
Sent 12 back-to-back POST /submissions requests from the same IP (limit: 10 per 60s)
Results: requests 1-10 returned 201, requests 11-12 returned 429

### Server stays up and serves normal traffic immediately after the burst
curl http://localhost:3000/health immediately after the burst test
Result: 200 - confirms rate limiting protects the endpoint without taking down the service
