
import test from "node:test";
import assert from "node:assert/strict";

import { validateToolCall } from "../src/guardrails.mjs";

test("Accept valid search parameters", () => {
  const args = {
    topic: "logarithms",
    difficulty: "easy",
    limit: 2
  };

  assert.deepEqual(
    validateToolCall("search_question_bank", args),
    args
  );
});

test("Reject unauthorized tool", () => {
  assert.throws(() => {
    validateToolCall("delete_student_data", {});
  }, /Tool is not allowed/);
});

test("Reject invalid topic", () => {
  assert.throws(() => {
    validateToolCall("search_question_bank", {
      topic: "unknown",
      difficulty: "easy",
      limit: 2
    });
  }, /Invalid mathematics topic/);
});

test("Reject excessive question limit", () => {
  assert.throws(() => {
    validateToolCall("search_question_bank", {
      topic: "powers",
      difficulty: "easy",
      limit: 100
    });
  }, /Invalid question limit/);
});

test("Reject unexpected arguments", () => {
  assert.throws(() => {
    validateToolCall("get_test_results", {
      studentId: "another_student"
    });
  }, /Unexpected arguments/);
});

test("Accept valid result request", () => {
  assert.deepEqual(
    validateToolCall("get_test_results", {}),
    {}
  );
});
