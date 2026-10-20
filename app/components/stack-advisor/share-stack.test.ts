import test from "node:test";
import assert from "node:assert/strict";

import { decodeSelections, encodeSelections } from "./share-stack";

test("share links encode and restore a stack selection", () => {
  const selections = {
    frontend: "nextjs",
    database: "supabase_db",
  };

  assert.deepEqual(
    decodeSelections(encodeSelections(selections)),
    selections,
  );
});

test("share links safely reject malformed and non-string selections", () => {
  assert.equal(decodeSelections("not-valid-base64"), null);
  assert.equal(
    decodeSelections(btoa(encodeURIComponent(JSON.stringify(["nextjs"])))),
    null,
  );
  assert.equal(
    decodeSelections(
      btoa(encodeURIComponent(JSON.stringify({ frontend: 42 }))),
    ),
    null,
  );
});
