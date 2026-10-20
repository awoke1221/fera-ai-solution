import test from "node:test";
import assert from "node:assert/strict";

import { getNextUnselectedCategory } from "./stack-selection-flow";

const categories = [
  { id: "frontend" },
  { id: "backend" },
  { id: "database" },
  { id: "auth" },
];

test("moves to the next unselected category after a tool is chosen", () => {
  assert.equal(
    getNextUnselectedCategory(
      categories,
      { frontend: "nextjs" },
      "frontend",
    ),
    "backend",
  );
});

test("skips categories already selected and wraps around in workflow order", () => {
  assert.equal(
    getNextUnselectedCategory(
      categories,
      { frontend: "nextjs", backend: "node", database: "postgres" },
      "database",
    ),
    "auth",
  );
  assert.equal(
    getNextUnselectedCategory(
      categories,
      { frontend: "nextjs", backend: "node", database: "postgres" },
      "auth",
    ),
    null,
  );
});

test("does not auto-navigate when there is no next category", () => {
  assert.equal(
    getNextUnselectedCategory([{ id: "frontend" }], {}, "frontend"),
    null,
  );
});
