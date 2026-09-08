---
title: Advanced JavaScript Design Patterns & Performance Optimization
excerpt: Master production-grade JavaScript patterns including factory, observer, singleton, state machines, reactive programming, and performance optimization techniques for enterprise applications.
section: Advanced Architecture
lesson: 2
difficulty: advanced
tags: javascript, design-patterns, performance, optimization, reactive-programming, es2024
content_type: markdown
date: 2026-09-09
---

# Advanced JavaScript Design Patterns & Performance Optimization

This comprehensive guide covers enterprise-level JavaScript patterns and optimization techniques used in production applications handling millions of users.

## Part 1: Advanced Design Patterns

### 1. Factory Pattern with Composition

**Problem**: Creating objects with complex initialization logic and multiple variants.

**Solution**: Use factory functions that return configured objects:

```javascript
class DatabaseConfig {
  constructor(type, settings) {
    this.type = type;
    this.settings = settings;
  }
}

// Factory function
function createDatabase(environment) {
  const configs = {
    production: () =>
      new DatabaseConfig("postgres", {
        host: process.env.DB_HOST,
        pool: 50,
        ssl: true,
        retry: { maxAttempts: 3 },
      }),
    development: () =>
      new DatabaseConfig("sqlite", {
        filename: ":memory:",
        pool: 1,
        ssl: false,
      }),
    testing: () =>
      new DatabaseConfig("sqlite", {
        filename: ":memory:",
        pool: 1,
      }),
  };

  const factory = configs[environment];
  if (!factory) throw new Error(`Unknown environment: ${environment}`);
  return factory();
}

// Usage
const db = createDatabase(process.env.NODE_ENV);
```

### 2. Observer Pattern for Reactive Systems

**Problem**: Multiple parts of an application need to react to state changes.

**Solution**: Implement a sophisticated observer pattern with unsubscription and error handling:

```javascript
class Observable {
  #subscribers = new Map();
  #nextId = 0;

  subscribe(observer) {
    const id = this.#nextId++;

    if (!this.#subscribers.has(id)) {
      this.#subscribers.set(id, observer);
    }

    // Return unsubscribe function
    return () => this.#subscribers.delete(id);
  }

  notify(value) {
    for (const observer of this.#subscribers.values()) {
      try {
        if (typeof observer === "function") {
          observer(value);
        } else if (observer.next) {
          observer.next(value);
        }
      } catch (error) {
        if (observer.error) {
          observer.error(error);
        } else {
          console.error("Unhandled error in observer:", error);
        }
      }
    }
  }

  complete() {
    for (const observer of this.#subscribers.values()) {
      if (observer.complete) {
        observer.complete();
      }
    }
    this.#subscribers.clear();
  }
}

// Usage with error handling
const dataSource = new Observable();

const unsubscribe = dataSource.subscribe({
  next: (value) => console.log("Data:", value),
  error: (err) => console.error("Error:", err),
  complete: () => console.log("Done"),
});

dataSource.notify({ id: 1, name: "Alice" });
unsubscribe();
```

### 3. Singleton Pattern with Lazy Initialization

**Problem**: Need a single instance of a resource-heavy object across the application.

**Solution**: Use module closure for true singleton:

```javascript
// Singleton factory
const Database = (() => {
  let instance;

  const createInstance = () => {
    console.log("Creating database instance...");
    return {
      connect: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Connected");
      },
      query: async (sql) => {
        console.log(`Executing: ${sql}`);
        return [];
      },
      disconnect: async () => {
        console.log("Disconnected");
      },
    };
  };

  return {
    getInstance: async () => {
      if (!instance) {
        instance = createInstance();
        await instance.connect();
      }
      return instance;
    },
    reset: () => {
      instance = null;
    },
  };
})();

// Usage - guaranteed single instance
const db1 = await Database.getInstance();
const db2 = await Database.getInstance();
console.log(db1 === db2); // true
```

### 4. State Machine Pattern for Complex Logic

**Problem**: Managing complex state transitions with many conditions.

**Solution**: Explicit state machine:

```javascript
class UserAuthStateMachine {
  #state = "unauthenticated";
  #transitions = {
    unauthenticated: {
      login: () => "authenticating",
      signup: () => "registering",
    },
    authenticating: {
      success: () => "authenticated",
      failure: () => "unauthenticated",
    },
    registering: {
      success: () => "authenticated",
      failure: () => "unauthenticated",
    },
    authenticated: {
      logout: () => "unauthenticated",
    },
  };

  #listeners = new Set();

  transition(event) {
    const allowed = this.#transitions[this.#state];
    if (!allowed || !allowed[event]) {
      throw new Error(`Invalid transition: ${event} from state ${this.#state}`);
    }

    const nextState = allowed[event]();
    console.log(`${this.#state} -> ${nextState} (${event})`);
    this.#state = nextState;

    this.#notifyListeners();
  }

  getState() {
    return this.#state;
  }

  onChange(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notifyListeners() {
    this.#listeners.forEach((listener) => listener(this.#state));
  }
}

// Usage
const auth = new UserAuthStateMachine();
auth.onChange((state) => console.log(`Auth state: ${state}`));

auth.transition("login"); // unauthenticated -> authenticating
auth.transition("success"); // authenticating -> authenticated
auth.transition("logout"); // authenticated -> unauthenticated
```

### 5. Strategy Pattern for Flexible Algorithms

**Problem**: Multiple algorithms for the same task (e.g., different validation strategies).

**Solution**: Strategy pattern:

```javascript
// Strategy interface (conceptual)
const ValidationStrategies = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^\d{10,}$/.test(value),
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  custom: (value, pattern) => new RegExp(pattern).test(value),
};

class Form {
  constructor() {
    this.fields = new Map();
  }

  addField(name, validator) {
    this.fields.set(name, { value: "", validator });
  }

  setValue(name, value) {
    const field = this.fields.get(name);
    if (!field) throw new Error(`Unknown field: ${name}`);
    field.value = value;
  }

  validate() {
    const errors = {};
    for (const [name, field] of this.fields) {
      if (!field.validator(field.value)) {
        errors[name] = `Invalid ${name}`;
      }
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }
}

// Usage
const form = new Form();
form.addField("email", ValidationStrategies.email);
form.addField("website", ValidationStrategies.url);

form.setValue("email", "user@example.com");
form.setValue("website", "https://example.com");

const { valid, errors } = form.validate();
console.log(valid ? "Valid form" : errors);
```

## Part 2: Performance Optimization

### 1. Memoization & Caching

**Problem**: Expensive computations repeated with same inputs.

**Solution**: Memoization:

```javascript
// Generic memoization decorator
function memoize(fn, options = {}) {
  const cache = new Map();
  const { ttl = Infinity, maxSize = 100 } = options;

  return function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (Date.now() - timestamp < ttl) {
        return value;
      }
      cache.delete(key);
    }

    const value = fn.apply(this, args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, { value, timestamp: Date.now() });
    return value;
  };
}

// Usage
const expensiveCalculation = memoize(
  (n) => {
    console.log(`Computing factorial of ${n}...`);
    return n <= 1 ? 1 : n * expensiveCalculation(n - 1);
  },
  { maxSize: 50 },
);

console.log(expensiveCalculation(5)); // Computes
console.log(expensiveCalculation(5)); // Returns cached
```

### 2. Lazy Evaluation with Generators

**Problem**: Processing large datasets without loading everything into memory.

**Solution**: Generator functions for lazy evaluation:

```javascript
// Process items lazily
function* lazyMap(items, fn) {
  for (const item of items) {
    yield fn(item);
  }
}

function* lazyFilter(items, predicate) {
  for (const item of items) {
    if (predicate(item)) yield item;
  }
}

// Combine generators
function* pipeline(items, ...operations) {
  let result = items;
  for (const operation of operations) {
    result = operation(result);
  }
  yield* result;
}

// Usage - only processes when consumed
const numbers = Array.from({ length: 1000000 }, (_, i) => i);

const result = pipeline(
  numbers,
  (items) => lazyFilter(items, (n) => n % 2 === 0),
  (items) => lazyMap(items, (n) => n * n),
);

// Only processes first 5 items
let count = 0;
for (const value of result) {
  console.log(value);
  if (++count === 5) break;
}
```

### 3. Debouncing & Throttling

**Problem**: Prevent excessive function calls during rapid events (e.g., resize, scroll, input).

**Solution**: Throttle and debounce utilities:

```javascript
// Throttle: Execute at most once every X milliseconds
function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId;

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, delay - timeSinceLastCall);
    }
  };
}

// Debounce: Execute only after X milliseconds of inactivity
function debounce(fn, delay) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Usage
const handleResize = throttle(() => {
  console.log("Window resized");
}, 500);

const handleSearch = debounce(async (query) => {
  const results = await fetch(`/api/search?q=${query}`);
  console.log(results);
}, 300);

window.addEventListener("resize", handleResize);
searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
```

### 4. Object Pool Pattern

**Problem**: Creating/destroying many objects is expensive (memory allocation, garbage collection).

**Solution**: Reuse objects from a pool:

```javascript
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    this.available = [];
    this.inUse = new Set();

    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (!this.inUse.has(obj)) {
      throw new Error("Object not from this pool");
    }

    this.inUse.delete(obj);
    this.reset(obj);
    this.available.push(obj);
  }

  stats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
    };
  }
}

// Usage
const imagePool = new ObjectPool(
  () => new Image(),
  (img) => {
    img.src = "";
    img.onload = null;
  },
  20,
);

const img = imagePool.acquire();
img.src = "photo.jpg";
img.onload = () => imagePool.release(img);
```

## Part 3: Memory Management & Cleanup

### Proper Cleanup Patterns

```javascript
class Component {
  #listeners = [];
  #timers = [];

  // Subscribe to events and register for cleanup
  addEventListener(target, event, handler) {
    target.addEventListener(event, handler);
    this.#listeners.push(() => {
      target.removeEventListener(event, handler);
    });
  }

  // Schedule timers and register for cleanup
  setTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    this.#timers.push(() => clearTimeout(id));
    return id;
  }

  // Cleanup all resources
  destroy() {
    this.#listeners.forEach((cleanup) => cleanup());
    this.#timers.forEach((cleanup) => cleanup());
    this.#listeners = [];
    this.#timers = [];
  }
}

// Usage
const component = new Component();
component.addEventListener(window, "resize", () => {
  console.log("Resized");
});

// When done, cleanup
component.destroy();
```

## Best Practices Summary

1. **Favor composition over inheritance** - Use object composition for flexibility
2. **Isolate state** - Use closures and private fields to encapsulate state
3. **Handle errors explicitly** - Always provide error handlers in async code
4. **Profile before optimizing** - Use Chrome DevTools to find real bottlenecks
5. **Clean up resources** - Always unsubscribe, clear timers, and remove listeners
6. **Use appropriate patterns** - Don't over-engineer; match pattern to problem complexity
