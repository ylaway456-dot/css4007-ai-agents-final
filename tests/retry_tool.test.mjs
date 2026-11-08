
import test from "node:test";
import assert from "node:assert/strict";
import { runToolWithRetry } from "../src/retry_tool.mjs";

function temporaryError() {
  const error = new Error("Temporary tool failure");
  error.code = "TOOL_TEMPORARY_FAILURE";
  return error;
}

// Test 1: Tool works immediately
test("Successful tool execution", async () => {
  const result = await runToolWithRetry(() => "OK");

  assert.equal(result.success, true);
  assert.equal(result.attempts, 1);
});

// Test 2: Tool recovers after one failure
test("Recovery after temporary failure", async () => {
  let calls = 0;

  const result = await runToolWithRetry(() => {
    calls++;

    if (calls === 1) {
      throw temporaryError();
    }

    return "Recovered";
  });

  assert.equal(result.success, true);
  assert.equal(result.attempts, 2);
  assert.equal(result.result, "Recovered");
});

// Test 3: Tool fails repeatedly
test("Stop after repeated failures", async () => {
  const result = await runToolWithRetry(() => {
    throw temporaryError();
  });

  assert.equal(result.success, false);
  assert.equal(result.attempts, 3);
  assert.equal(result.trace.length, 3);
});

// Test 4: Permanent error is not retried
test("Do not retry permanent errors", async () => {
  const result = await runToolWithRetry(() => {
    throw new Error("Invalid tool arguments");
  });

  assert.equal(result.success, false);
  assert.equal(result.attempts, 1);
});
