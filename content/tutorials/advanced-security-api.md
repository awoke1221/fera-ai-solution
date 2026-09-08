---
title: Security Hardening & Advanced API Design
excerpt: Master authentication/authorization, API security, data protection, OWASP best practices, rate limiting, input validation, and building RESTful/GraphQL APIs for enterprise applications.
section: Advanced Architecture
lesson: 6
difficulty: advanced
tags: security, api-design, authentication, authorization, owasp, encryption, best-practices
content_type: markdown
date: 2026-09-09
---

# Security Hardening & Advanced API Design

Comprehensive guide to building secure applications and designing robust APIs for enterprise use.

## Part 1: Authentication & Authorization

### 1. Secure Authentication Implementation

**JWT with refresh tokens**:

```typescript
import jwt from "jsonwebtoken";
import crypto from "crypto";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private readonly accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
  private readonly refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
  private readonly accessTokenExpiry = "15m";
  private readonly refreshTokenExpiry = "7d";

  // Generate tokens
  generateTokens(userId: number, role: string): AuthTokens {
    const accessToken = jwt.sign({ userId, role }, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(
      { userId, type: "refresh" },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // Verify access token
  verifyAccessToken(token: string): { userId: number; role: string } {
    try {
      return jwt.verify(token, this.accessTokenSecret) as any;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  // Refresh access token using refresh token
  refreshAccessToken(refreshToken: string): string {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any;

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return jwt.sign({ userId: decoded.userId }, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
      });
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  // Revoke token (add to blacklist)
  async revokeToken(token: string): Promise<void> {
    const decoded = jwt.decode(token) as any;
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      // Store in Redis with TTL
      await redisClient.setex(`blacklist:${token}`, ttl, "1");
    }
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  }
}
```

### 2. Role-Based Access Control (RBAC)

```typescript
type Permission = "read" | "write" | "delete" | "admin";
type Role = "user" | "moderator" | "admin";

interface RolePermissions {
  [key: Role]: Permission[];
}

const permissions: RolePermissions = {
  user: ["read"],
  moderator: ["read", "write", "delete"],
  admin: ["read", "write", "delete", "admin"],
};

// Middleware for authorization
function authorize(requiredPermission: Permission) {
  return (req: any, res: any, next: any) => {
    const user = req.user; // From auth middleware

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userPermissions = permissions[user.role];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}

// Attribute-Based Access Control (ABAC) for fine-grained control
class AccessControl {
  canUserEditPost(userId: number, post: Post): boolean {
    // User can edit their own posts, or admins can edit any post
    return userId === post.authorId || userId === 1; // 1 = admin
  }

  canUserDeleteComment(userId: number, comment: Comment): boolean {
    // User can delete within 24 hours, or authors can always delete
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return comment.authorId === userId && comment.createdAt > oneDayAgo;
  }
}

// Usage
const ac = new AccessControl();

app.delete("/posts/:id", authorize("write"), (req, res) => {
  const post = getPost(req.params.id);

  if (!ac.canUserEditPost(req.user.id, post)) {
    return res.status(403).json({ error: "Cannot edit this post" });
  }

  // Delete post
});
```

## Part 2: OWASP Security

### 1. Input Validation & Sanitization

```typescript
// Input validation
class InputValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length < 254;
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push("Password must be at least 12 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Password must contain special character");
    }

    return { valid: errors.length === 0, errors };
  }

  static sanitizeHTML(input: string): string {
    // Remove potentially dangerous HTML
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  static validateInt(value: unknown, min: number, max: number): number {
    const parsed = parseInt(String(value), 10);

    if (isNaN(parsed) || parsed < min || parsed > max) {
      throw new Error(`Invalid integer: must be between ${min} and ${max}`);
    }

    return parsed;
  }
}

// Usage with middleware
app.post("/users", (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!InputValidator.validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const passwordValidation = InputValidator.validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ errors: passwordValidation.errors });
  }

  // Process...
});
```

### 2. XSS Prevention

```typescript
// Content Security Policy (CSP) headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' trusted-cdn.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  next();
});

// Prevent DOM-based XSS
function setUserContent(element: HTMLElement, content: string) {
  // WRONG: element.innerHTML = content; // Vulnerable!

  // RIGHT: Use textContent for plain text
  element.textContent = content;

  // OR use a library like DOMPurify for HTML
  // element.innerHTML = DOMPurify.sanitize(content);
}

// Encode user input in responses
function formatUserMessage(username: string, message: string): string {
  return `<p>${InputValidator.sanitizeHTML(username)}: ${InputValidator.sanitizeHTML(message)}</p>`;
}
```

### 3. CSRF Protection

```typescript
import csrf from "csurf";
import cookieParser from "cookie-parser";

// CSRF protection middleware
app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Generate CSRF token for forms
app.get("/form", (req, res) => {
  res.send(`
    <form method="POST" action="/submit">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="message">
      <button type="submit">Send</button>
    </form>
  `);
});

// Verify CSRF token on form submission
app.post("/submit", (req, res) => {
  // Middleware automatically verifies token
  res.send("Form submitted successfully");
});

// For JSON APIs, include token in header
// Client: fetch('/api/data', {
//   method: 'POST',
//   headers: { 'X-CSRF-Token': token },
//   body: JSON.stringify(data)
// })
```

### 4. SQL Injection Prevention

```typescript
// WRONG: Vulnerable to SQL injection
// const query = `SELECT * FROM users WHERE email = '${email}'`;

// RIGHT: Use parameterized queries
const query = "SELECT * FROM users WHERE email = ?";
const result = await db.query(query, [email]);

// ORMs automatically use parameterized queries
const user = await User.findOne({ where: { email } });

// For complex queries, use parameter binding
const query = `
  INSERT INTO users (email, name, created_at)
  VALUES ($1, $2, $3)
`;
const result = await db.query(query, [email, name, new Date()]);
```

## Part 3: API Design

### 1. RESTful API Best Practices

```typescript
// Versioning
app.get("/api/v1/users", (req, res) => {
  // Version 1 implementation
});

app.get("/api/v2/users", (req, res) => {
  // Version 2 implementation with breaking changes
});

// Proper status codes
app.post("/api/users", async (req, res) => {
  const { email, name } = req.body;

  // Validation
  if (!email || !name) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Email and name are required",
    });
  }

  // Authorization
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Forbidden
  if (!req.user.canCreateUsers) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const user = await createUser(email, name);

    // 201 Created
    res.status(201).json({
      data: user,
      links: {
        self: `/api/v1/users/${user.id}`,
      },
    });
  } catch (error) {
    if (error.code === "UNIQUE_VIOLATION") {
      return res.status(409).json({ error: "Conflict: Email already exists" });
    }

    // 500 Internal Server Error
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Pagination
app.get("/api/users", async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.findAll({ offset, limit }),
    User.count(),
  ]);

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    links: {
      self: `/api/users?page=${page}&limit=${limit}`,
      next:
        page * limit < total
          ? `/api/users?page=${page + 1}&limit=${limit}`
          : null,
      prev: page > 1 ? `/api/users?page=${page - 1}&limit=${limit}` : null,
    },
  });
});

// Filtering, sorting, searching
app.get("/api/users", async (req, res) => {
  const {
    role, // Filter by role
    sort = "-created_at", // Sort by created_at descending
    search, // Full text search
  } = req.query;

  let query = User.query();

  // Filtering
  if (role) {
    query = query.where("role", role);
  }

  // Search
  if (search) {
    query = query.where((raw) => {
      raw
        .whereRaw("email ILIKE ?", [`%${search}%`])
        .orWhereRaw("name ILIKE ?", [`%${search}%`]);
    });
  }

  // Sorting
  const sortField = sort.replace(/^-/, "");
  const sortDir = sort.startsWith("-") ? "desc" : "asc";
  query = query.orderBy(sortField, sortDir);

  const users = await query;
  res.json({ data: users });
});
```

### 2. Error Handling & Standardized Responses

```typescript
// Standard API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Centralized error handler
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
  }
}

// Global error middleware
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "An unexpected error occurred";

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details: err.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  };

  // Log errors
  if (statusCode >= 500) {
    logger.error(response);
  }

  res.status(statusCode).json(response);
});

// Usage
app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(
        404,
        "USER_NOT_FOUND",
        `User with ID ${req.params.id} not found`,
      );
    }

    res.json({
      success: true,
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  } catch (error) {
    next(error);
  }
});
```

### 3. Rate Limiting

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

// Rate limiting with Redis
const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rate-limit:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: "Too many requests, please try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Only count failed attempts
});

app.post("/api/login", authLimiter, async (req, res) => {
  // Login logic
});

// Apply general limiter to all API routes
app.use("/api/", limiter);

// Different limits for different users
const userLimiter = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => req.user?.isPremium, // Skip for premium users
  max: (req) => (req.user?.isPremium ? 1000 : 100),
});

app.use("/api/data", userLimiter);
```

### 4. API Documentation (OpenAPI/Swagger)

```typescript
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// In route file
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get("/api/users", (req, res) => {
  // Implementation
});
```

## Part 4: Data Protection

### 1. Encryption

```typescript
import crypto from "crypto";

class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly encryptionKey = Buffer.from(
    process.env.ENCRYPTION_KEY!,
    "hex",
  );

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// Usage
const encryption = new EncryptionService();
const encrypted = encryption.encrypt("sensitive-data");
const decrypted = encryption.decrypt(encrypted);
```

### 2. Password Hashing

```typescript
import bcrypt from "bcrypt";

class PasswordService {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12); // 12 rounds (recommended)
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Usage
const hashedPassword = await PasswordService.hash(password);
const isValid = await PasswordService.verify(passwordAttempt, hashedPassword);
```

## Security Checklist

- [ ] HTTPS enforced everywhere
- [ ] HSTS headers configured
- [ ] JWT with short expiry and refresh tokens
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (CSP headers, sanitization)
- [ ] CSRF tokens for state-changing operations
- [ ] CORS properly configured
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Passwords hashed with bcrypt
- [ ] Secrets managed with environment variables
- [ ] API versioning in place
- [ ] Error messages don't leak sensitive info
- [ ] Logging and monitoring configured
- [ ] Regular security audits scheduled
- [ ] Dependencies kept up-to-date
- [ ] Security headers all configured
