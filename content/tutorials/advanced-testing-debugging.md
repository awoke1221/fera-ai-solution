---
title: Advanced Testing & Debugging Strategies for Web Applications
excerpt: Master unit testing, integration testing, e2e testing, test coverage strategies, debugging techniques, performance profiling, and production monitoring for enterprise applications.
section: Advanced Architecture
lesson: 5
difficulty: advanced
tags: testing, debugging, quality-assurance, performance-profiling, monitoring, best-practices
content_type: markdown
date: 2026-09-09
---

# Advanced Testing & Debugging Strategies for Web Applications

Comprehensive guide to testing strategies, debugging techniques, and monitoring that ensure production-grade reliability.

## Part 1: Testing Strategy

### 1. Testing Pyramid

```
        △
       /|\
      / | \
     /  |  \
    / E2E  \        (1) End-to-end tests
   /--------- \      (10-20% of tests)
  /  | | | |  \
 / Int. Tests  \    (30-50% of tests)
/--------|------\
| Unit Tests    |   (50-70% of tests)
└────────────────┘
```

**Implementation strategy**:

```typescript
// Unit Tests - Test individual functions in isolation
describe("UserValidator", () => {
  it("should validate correct email format", () => {
    expect(UserValidator.validateEmail("test@example.com")).toBe(true);
    expect(UserValidator.validateEmail("invalid")).toBe(false);
  });

  it("should validate password strength", () => {
    const result = UserValidator.validatePassword("WeakPass");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password too short");
  });
});

// Integration Tests - Test multiple components together
describe("UserService with Repository", () => {
  let userService: UserService;
  let repository: UserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    userService = new UserService(repository);
  });

  it("should create and retrieve user", async () => {
    const user = await userService.createUser("test@example.com", "Alice");
    const retrieved = await repository.findById(user.id);

    expect(retrieved).toEqual(user);
  });

  it("should prevent duplicate emails", async () => {
    await userService.createUser("test@example.com", "Alice");

    await expect(
      userService.createUser("test@example.com", "Bob"),
    ).rejects.toThrow("Email already exists");
  });
});

// E2E Tests - Test complete user flows
describe("User Registration Flow", () => {
  it("should complete registration from signup to login", async () => {
    await page.goto("http://localhost:3000/signup");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button[type="submit"]');

    await page.waitForNavigation();
    expect(page.url()).toBe("http://localhost:3000/dashboard");
  });
});
```

### 2. Test Coverage Strategy

**Effective coverage patterns**:

```typescript
// Coverage for critical paths (must have 100%)
describe('Authentication', () => {
  it('should accept valid token', () => {
    const token = jwt.sign({ userId: 1 }, 'secret');
    expect(auth.verify(token)).toEqual({ userId: 1 });
  });

  it('should reject invalid token', () => {
    expect(() => auth.verify('invalid')).toThrow('Invalid token');
  });

  it('should reject expired token', () => {
    const token = jwt.sign({ userId: 1 }, 'secret', { expiresIn: '-1h' });
    expect(() => auth.verify(token)).toThrow('Token expired');
  });
});

// Coverage for business logic (aim for >80%)
describe('PricingCalculator', () => {
  it('should calculate base price', () => {
    expect(calculator.calculate(100)).toBe(100);
  });

  it('should apply discount for quantity >= 10', () => {
    expect(calculator.calculate(100, 10)).toBe(90);
  });

  it('should apply tax', () => {
    expect(calculator.calculate(100, 1, { tax: 0.1 })).toBe(110);
  });

  it('should handle combined discount and tax', () => {
    expect(calculator.calculate(100, 10, { tax: 0.1 })).toBe(99);
  });
});

// Snapshot testing for UI changes
describe('UserCard', () => {
  it('should match snapshot', () => {
    const result = render(<UserCard user={{ name: 'Alice', email: 'alice@example.com' }} />);
    expect(result).toMatchSnapshot();
  });
});
```

## Part 2: Advanced Testing Techniques

### 1. Mock, Stub, and Spy Patterns

```typescript
import { jest } from "@jest/globals";

// Spying on function calls
describe("DataFetcher", () => {
  it("should call fetch with correct URL", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ id: 1, name: "Alice" }),
    } as Response);

    const data = await fetcher.getUser(1);

    expect(fetchSpy).toHaveBeenCalledWith("/api/users/1");
    expect(data).toEqual({ id: 1, name: "Alice" });

    fetchSpy.mockRestore();
  });
});

// Stubbing external dependencies
describe("UserService", () => {
  it("should handle API errors gracefully", async () => {
    const stubRepository = {
      findById: jest.fn().mockRejectedValue(new Error("Connection failed")),
    };

    const service = new UserService(stubRepository);

    await expect(service.getUser(1)).rejects.toThrow("Failed to fetch user");
  });
});

// Partial mocking
describe("Analytics", () => {
  it("should track events", () => {
    const mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    };

    const analytics = new Analytics(mockLogger);
    analytics.track("user_signup");

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ event: "user_signup" }),
    );
  });
});

// Mock timers for time-dependent code
describe("Timer", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("should timeout after specified duration", () => {
    const callback = jest.fn();
    const timer = new Timer(callback, 1000);

    jest.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalled();
  });
});
```

### 2. Test Data Factories

```typescript
// Factory pattern for consistent test data
class UserFactory {
  static minimal(overrides?: Partial<User>): User {
    return {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      ...overrides,
    };
  }

  static admin(overrides?: Partial<User>): User {
    return this.minimal({
      role: "admin",
      ...overrides,
    });
  }

  static batch(count: number): User[] {
    return Array.from({ length: count }, (_, i) => this.minimal({ id: i + 1 }));
  }
}

// Usage in tests
describe("UserRepository", () => {
  it("should fetch all admins", async () => {
    const admin1 = UserFactory.admin({ id: 1 });
    const admin2 = UserFactory.admin({ id: 2 });
    const user = UserFactory.minimal();

    repository.addUser(admin1);
    repository.addUser(admin2);
    repository.addUser(user);

    const admins = await repository.findByRole("admin");
    expect(admins).toHaveLength(2);
  });
});
```

### 3. Property-Based Testing

```typescript
// Generate random test cases automatically
describe("StringUtils", () => {
  it("should reverse string correctly", () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const reversed = StringUtils.reverse(str);
        expect(StringUtils.reverse(reversed)).toBe(str);
      }),
    );
  });

  it("should split and join preserve content", () => {
    fc.assert(
      fc.property(fc.string(), fc.string({ minLength: 1 }), (text, sep) => {
        const parts = text.split(sep);
        const joined = parts.join(sep);

        if (!sep.includes(text)) {
          expect(joined).toBe(text);
        }
      }),
    );
  });
});
```

## Part 3: Debugging Techniques

### 1. Chrome DevTools Mastery

**Advanced debugging workflow**:

```javascript
// 1. Set breakpoints programmatically
debugger; // Execution stops here when DevTools open

// 2. Conditional breakpoints
// Right-click breakpoint → "Add conditional breakpoint"
// Condition: response.status >= 400

// 3. DOM breakpoints
// Right-click element → Break on... → Subtree modifications

// 4. Event listener breakpoints
// DevTools → Sources → Event Listener Breakpoints
// Select: click, input, change, load, etc.

// 5. Use logpoint instead of console.log
// Right-click breakpoint → "Add logpoint"
// Expression: `Received response: ${response.status}`

// 6. Watch expressions
// Watch complex values without slowing performance
const user = { id: 1, name: "Alice", profile: { bio: "Developer" } };
// Watch: user.profile.bio

// 7. Scope inspection
function myFunction(param) {
  const local = "value";
  debugger; // Inspect param and local in Scope panel
}

// 8. Call stack analysis
function caller() {
  callee();
}

function callee() {
  debugger; // Call Stack shows: callee ← caller ← main
}
```

### 2. Performance Profiling

```javascript
// Measure specific operations
console.time('database-query');
const results = await db.query('SELECT * FROM users');
console.timeEnd('database-query');

// More sophisticated profiling
class PerformanceMonitor {
  static #marks = new Map();

  static start(label: string) {
    this.#marks.set(label, performance.now());
  }

  static end(label: string) {
    const start = this.#marks.get(label);
    if (!start) {
      console.warn(`No start mark for ${label}`);
      return;
    }

    const duration = performance.now() - start;
    console.log(`${label}: ${duration.toFixed(2)}ms`);

    // Send to monitoring service
    this.report(label, duration);
  }

  private static report(label: string, duration: number) {
    if (duration > 100) { // Report slow operations
      analytics.track('slow_operation', { label, duration });
    }
  }
}

// Usage
PerformanceMonitor.start('api-call');
const data = await fetch('/api/data').then(r => r.json());
PerformanceMonitor.end('api-call');

// Navigate timing API
window.addEventListener('load', () => {
  const timing = performance.timing;
  const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
  console.log(`Page load time: ${pageLoadTime}ms`);
});

// Long Task API
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.warn('Long task:', entry.duration);
    }
  });
  observer.observe({ entryTypes: ['longtask'] });
}
```

### 3. Network Debugging

```javascript
// Intercept network requests
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const [resource, config] = args;

  console.log("→ Request:", resource, config);

  return originalFetch
    .apply(this, args)
    .then((response) => {
      console.log("← Response:", response.status, response.statusText);
      return response;
    })
    .catch((error) => {
      console.error("✗ Network Error:", error);
      throw error;
    });
};

// Log all failed requests
window.addEventListener("error", (event) => {
  if (event.type === "error") {
    console.error("Resource failed to load:", event.target.src);
  }
});

// Monitor unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);

  // Send to error tracking service
  errorTracker.captureException(event.reason);
});
```

## Part 4: Production Monitoring

### 1. Error Tracking

```typescript
// Centralized error handling
class ErrorTracker {
  private static apiKey = process.env.REACT_APP_SENTRY_KEY;

  static initialize() {
    window.addEventListener("error", (event) => {
      this.captureException(event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.captureException(event.reason);
    });
  }

  static captureException(error: Error, context?: Record<string, any>) {
    const payload = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context,
      userAgent: navigator.userAgent,
    };

    // Send to error tracking service
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Failed to report error:", err));
  }
}

// Usage
try {
  riskyOperation();
} catch (error) {
  ErrorTracker.captureException(error, {
    operation: "riskyOperation",
    userId: currentUser.id,
  });
}

ErrorTracker.initialize();
```

### 2. Performance Monitoring

```typescript
class PerformanceTracker {
  static reportWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entry = list.getEntries().pop();
      this.report("LCP", entry?.renderTime || entry?.loadTime || 0);
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // First Input Delay (Interaction to Next Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report("INP", entry.processingDuration);
      }
    }).observe({ entryTypes: ["interaction"] });

    // Cumulative Layout Shift
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
          this.report("CLS", cls);
        }
      }
    }).observe({ entryTypes: ["layout-shift"] });
  }

  private static report(metric: string, value: number) {
    console.log(`${metric}: ${value}`);

    // Send to analytics
    fetch("/api/metrics", {
      method: "POST",
      body: JSON.stringify({
        metric,
        value,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
}

PerformanceTracker.reportWebVitals();
```

### 3. User Behavior Analytics

```typescript
class BehaviorAnalytics {
  private static sessionId = this.generateSessionId();

  static trackPageView() {
    fetch("/api/analytics/pageview", {
      method: "POST",
      body: JSON.stringify({
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    });
  }

  static trackEvent(eventName: string, properties?: Record<string, any>) {
    fetch("/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: this.sessionId,
        event: eventName,
        properties,
        timestamp: Date.now(),
      }),
    });
  }

  static trackUserFlow(flowName: string, step: number, data?: any) {
    fetch("/api/analytics/flow", {
      method: "POST",
      body: JSON.stringify({
        sessionId: this.sessionId,
        flow: flowName,
        step,
        data,
        timestamp: Date.now(),
      }),
    });
  }

  private static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Track user interactions
document.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest("button");
  if (button) {
    BehaviorAnalytics.trackEvent("button_click", {
      buttonText: button.textContent,
    });
  }
});

BehaviorAnalytics.trackPageView();
```

## Testing Checklist

- [ ] Unit tests for business logic (80%+ coverage)
- [ ] Integration tests for critical flows
- [ ] E2E tests for user journeys
- [ ] Error scenarios covered
- [ ] Edge cases identified and tested
- [ ] Performance tests in place
- [ ] Load testing completed
- [ ] Accessibility tests automated
- [ ] Snapshot tests for UI components
- [ ] Property-based tests for algorithms

## Debugging Checklist

- [ ] Chrome DevTools profiling tools mastered
- [ ] Network debugging capabilities understood
- [ ] Memory leak detection practiced
- [ ] Error tracking system implemented
- [ ] Performance monitoring in place
- [ ] User behavior tracking enabled
- [ ] Logs aggregated and searchable
- [ ] Alert thresholds configured
- [ ] Root cause analysis process established
- [ ] Post-mortem review template created
