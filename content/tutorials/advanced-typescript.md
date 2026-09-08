---
title: TypeScript Mastery for Enterprise Applications
excerpt: Advanced TypeScript patterns, generic types, utility types, decorators, module resolution, and architectural patterns for building scalable enterprise applications.
section: Advanced Architecture
lesson: 4
difficulty: advanced
tags: typescript, type-safety, generics, advanced-types, architecture, enterprise
content_type: markdown
date: 2026-09-09
---

# TypeScript Mastery for Enterprise Applications

Master advanced TypeScript patterns and techniques for building production-grade enterprise applications with complete type safety.

## Part 1: Advanced Type System

### 1. Generic Types & Constraints

**Building reusable, type-safe components**:

```typescript
// Generic with type constraints
interface Repository<T extends { id: number }> {
  find(id: number): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: number): Promise<void>;
}

// Concrete implementation
interface User {
  id: number;
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  async find(id: number): Promise<User | null> {
    // Implementation
    return null;
  }

  async save(user: User): Promise<void> {
    // Implementation
  }

  async delete(id: number): Promise<void> {
    // Implementation
  }
}

// Generic function with multiple constraints
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 } as T & U;
}

const result = merge({ id: 1, name: "Alice" }, { email: "alice@example.com" });
// result: { id: 1; name: 'Alice'; email: 'alice@example.com' }

// Conditional types (ternary for types)
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>; // number
```

### 2. Utility Types & Type Manipulation

**Built-in and custom utility types**:

```typescript
// Extract readonly properties
type ReadonlyKeys<T> = {
  [K in keyof T]-?: T[K] extends Readonly<any> ? K : never;
}[keyof T];

// Getters and setters
type Getter<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { id: number; name: string };
type UserGetters = Getter<User>;
// Result: { getId: () => number; getName: () => string }

// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

const user: DeepReadonly<{
  id: number;
  profile: { name: string };
}> = {
  id: 1,
  profile: { name: "Alice" },
};

// Can't modify
// user.id = 2; // Error
// user.profile.name = 'Bob'; // Error

// Omit multiple keys
type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutEmail = OmitKeys<User, "email" | "phone">;

// Recursive partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Strict optional properties
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

### 3. Advanced Pattern Matching

**Discriminated unions for type safety**:

```typescript
// Error handling with discriminated unions
type Success<T> = { status: "success"; data: T };
type Error = { status: "error"; message: string; code: number };
type Result<T> = Success<T> | Error;

function handleResult<T>(result: Result<T>): void {
  if (result.status === "success") {
    // TypeScript knows result.data exists here
    console.log("Success:", result.data);
  } else {
    // TypeScript knows result.message exists here
    console.log("Error:", result.message);
  }
}

// API response patterns
type ApiResponse<T> =
  | { status: 200; data: T }
  | { status: 400; error: "ValidationError"; details: string[] }
  | { status: 401; error: "Unauthorized" }
  | { status: 404; error: "NotFound" }
  | { status: 500; error: "InternalError"; requestId: string };

function parseResponse<T>(response: ApiResponse<T>): T {
  switch (response.status) {
    case 200:
      return response.data;
    case 400:
      throw new Error(`Validation failed: ${response.details.join(", ")}`);
    case 401:
      throw new Error("Authentication required");
    case 404:
      throw new Error("Not found");
    case 500:
      throw new Error(`Server error (${response.requestId})`);
  }
}
```

### 4. Template Literal Types

**String literal types for compile-time safety**:

```typescript
// Build URLs at compile time
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Route = `/${string}`;

type ApiEndpoint = `${HttpMethod} ${Route}`;

const endpoint1: ApiEndpoint = "GET /users"; // ✓
const endpoint2: ApiEndpoint = "POST /users"; // ✓
// const endpoint3: ApiEndpoint = 'PATCH /users'; // Error

// Event names with type safety
type EventMap = {
  "user:login": { userId: number };
  "user:logout": { reason: string };
  "page:navigate": { from: string; to: string };
};

type EventName = keyof EventMap;
type EventPayload<E extends EventName> = EventMap[E];

// Type-safe event emitter
class TypedEventEmitter {
  on<E extends EventName>(
    event: E,
    handler: (payload: EventPayload<E>) => void,
  ) {
    // Implementation
  }

  emit<E extends EventName>(event: E, payload: EventPayload<E>) {
    // Implementation
  }
}

const emitter = new TypedEventEmitter();
emitter.on("user:login", (payload) => {
  console.log(payload.userId); // ✓
  // console.log(payload.reason); // Error
});

// String validation with types
type ValidEmail = string & { readonly __brand: "ValidEmail" };
type ValidUrl = string & { readonly __brand: "ValidUrl" };

function validateEmail(email: string): email is ValidEmail {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUrl(url: string): url is ValidUrl {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

let email = "user@example.com";
if (validateEmail(email)) {
  // TypeScript now treats email as ValidEmail
  const validEmail: ValidEmail = email;
}
```

## Part 2: Advanced Patterns

### 1. Builder Pattern with Type Safety

```typescript
interface PageConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
}

class PageBuilder {
  private config: Partial<PageConfig> = {};

  setTitle(title: string): this {
    this.config.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  addKeyword(keyword: string): this {
    this.config.keywords ??= [];
    this.config.keywords.push(keyword);
    return this;
  }

  setOgImage(url: string): this {
    this.config.ogImage = url;
    return this;
  }

  setCanonical(url: string): this {
    this.config.canonical = url;
    return this;
  }

  build(): PageConfig {
    if (
      !this.config.title ||
      !this.config.description ||
      !this.config.keywords
    ) {
      throw new Error("Missing required fields");
    }
    return this.config as PageConfig;
  }
}

// Usage
const page = new PageBuilder()
  .setTitle("My Blog")
  .setDescription("A blog about web development")
  .addKeyword("typescript")
  .addKeyword("web-development")
  .setOgImage("https://example.com/og.jpg")
  .build();
```

### 2. Dependency Injection Container

```typescript
type Constructor<T> = new (...args: any[]) => T;
type ServiceFactory<T> = (...args: any[]) => T;

class DIContainer {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();

  register<T>(key: string, factory: ServiceFactory<T>, singleton = false) {
    if (singleton) {
      this.services.set(key, () => {
        if (!this.singletons.has(key)) {
          this.singletons.set(key, factory());
        }
        return this.singletons.get(key);
      });
    } else {
      this.services.set(key, factory);
    }
    return this;
  }

  registerClass<T>(
    key: string,
    constructor: Constructor<T>,
    singleton = false,
  ) {
    return this.register(key, () => new constructor(), singleton);
  }

  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service not found: ${key}`);
    }
    return factory();
  }
}

// Usage
class DatabaseService {
  connect() {
    console.log("Connected to database");
  }
}

class UserService {
  constructor(private db: DatabaseService) {}

  getUser(id: number) {
    console.log(`Getting user ${id}`);
  }
}

const container = new DIContainer();
container.registerClass("db", DatabaseService, true);
container.register(
  "userService",
  () => {
    return new UserService(container.get<DatabaseService>("db"));
  },
  true,
);

const userService = container.get<UserService>("userService");
```

### 3. Result Type for Error Handling

```typescript
type Ok<T> = { kind: "ok"; value: T };
type Err<E> = { kind: "err"; error: E };
type Result<T, E> = Ok<T> | Err<E>;

class ResultError<T, E> {
  static ok<T, E>(value: T): Result<T, E> {
    return { kind: "ok", value };
  }

  static err<T, E>(error: E): Result<T, E> {
    return { kind: "err", error };
  }

  static isOk<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.kind === "ok";
  }

  static isErr<T, E>(result: Result<T, E>): result is Err<E> {
    return result.kind === "err";
  }

  static map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.kind === "ok"
      ? { kind: "ok", value: fn(result.value) }
      : result;
  }

  static flatMap<T, E, U>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> {
    return result.kind === "ok" ? fn(result.value) : result;
  }

  static getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
    return result.kind === "ok" ? result.value : defaultValue;
  }
}

// Usage
function parseJson(json: string): Result<unknown, string> {
  try {
    return ResultError.ok(JSON.parse(json));
  } catch (e) {
    return ResultError.err("Invalid JSON");
  }
}

const result = parseJson('{"name": "Alice"}');

if (ResultError.isOk(result)) {
  console.log("Parsed:", result.value);
} else {
  console.error("Error:", result.error);
}
```

## Part 3: Architecture Patterns

### 1. Clean Architecture Layers

```typescript
// Domain layer - business logic
interface User {
  id: number;
  name: string;
  email: string;
}

class UserDomain {
  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static create(name: string, email: string): Result<User, string> {
    if (!name.trim()) {
      return ResultError.err("Name is required");
    }
    if (!this.validateEmail(email)) {
      return ResultError.err("Invalid email");
    }
    return ResultError.ok({ id: 0, name, email });
  }
}

// Data layer - data access
interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
}

class UserRepositoryImpl implements UserRepository {
  async save(user: User): Promise<User> {
    // Call API or database
    return user;
  }

  async findById(id: number): Promise<User | null> {
    // Fetch from database
    return null;
  }
}

// Application layer - use cases
class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<Result<User, string>> {
    const userResult = UserDomain.create(name, email);

    if (!ResultError.isOk(userResult)) {
      return userResult;
    }

    try {
      const savedUser = await this.userRepository.save(userResult.value);
      return ResultError.ok(savedUser);
    } catch (error) {
      return ResultError.err("Failed to save user");
    }
  }
}

// Presentation layer - API/UI
class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async handleCreateUser(req: any): Promise<any> {
    const result = await this.createUserUseCase.execute(
      req.body.name,
      req.body.email,
    );

    if (ResultError.isOk(result)) {
      return { status: 201, body: result.value };
    } else {
      return { status: 400, body: { error: result.error } };
    }
  }
}
```

### 2. Plugin Architecture

```typescript
// Core plugin interface
interface Plugin {
  name: string;
  version: string;
  install(app: Application): void;
}

interface ApplicationHooks {
  beforeLoad: (path: string) => Promise<void>[];
  afterLoad: (data: any) => Promise<void>[];
}

class Application {
  private plugins: Plugin[] = [];
  private hooks: Map<string, Function[]> = new Map();

  use(plugin: Plugin): this {
    this.plugins.push(plugin);
    plugin.install(this);
    return this;
  }

  on<K extends keyof ApplicationHooks>(
    hook: K,
    handler: ApplicationHooks[K],
  ): this {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, []);
    }
    this.hooks.get(hook)!.push(handler as Function);
    return this;
  }

  async runHook<K extends keyof ApplicationHooks>(
    hook: K,
    ...args: any[]
  ): Promise<void> {
    const handlers = this.hooks.get(hook as string) || [];
    for (const handler of handlers) {
      await (handler as Function)(...args);
    }
  }
}

// Example plugin
class LoggingPlugin implements Plugin {
  name = "Logging";
  version = "1.0.0";

  install(app: Application): void {
    app.on("beforeLoad", async (path) => {
      console.log(`Loading: ${path}`);
    });

    app.on("afterLoad", async (data) => {
      console.log(`Loaded data:`, data);
    });
  }
}

// Usage
const app = new Application();
app.use(new LoggingPlugin());
```

## Part 4: Module Resolution & Configuration

### TypeScript Configuration Best Practices

```json
{
  "compilerOptions": {
    // Strict mode - enables all strict type-checking options
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Module resolution
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // Paths for clean imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },

    // Output configuration
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Performance
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Summary Checklist

- [ ] Generic types with constraints mastered
- [ ] Utility types and type manipulation understood
- [ ] Discriminated unions used for error handling
- [ ] Template literal types implemented
- [ ] Builder pattern with type safety
- [ ] Dependency injection container
- [ ] Result type for functional error handling
- [ ] Clean architecture layers separated
- [ ] Plugin architecture for extensibility
- [ ] TypeScript configuration optimized
- [ ] Path aliases configured
- [ ] Strict mode enabled
