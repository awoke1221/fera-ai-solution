import test from "node:test";
import assert from "node:assert/strict";

import { isActivePath, shouldHideNav } from "./nav-utils";

test("treats exact and nested routes as active", () => {
  assert.equal(isActivePath("/services", "/services"), true);
  assert.equal(isActivePath("/services/ai", "/services"), true);
  assert.equal(isActivePath("/about", "/services"), false);
});

test("keeps the nav visible while the menu is open and near the top", () => {
  assert.equal(
    shouldHideNav({ scrollY: 40, lastScrollY: 200, menuOpen: false }),
    false,
  );
  assert.equal(
    shouldHideNav({ scrollY: 120, lastScrollY: 80, menuOpen: true }),
    false,
  );
  assert.equal(
    shouldHideNav({ scrollY: 150, lastScrollY: 90, menuOpen: false }),
    true,
  );
});
