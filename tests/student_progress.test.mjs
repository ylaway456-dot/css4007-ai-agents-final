import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { get_student_progress } from "../src/get_student_progress.mjs";
import { validateToolCall } from "../src/guardrails.mjs";

function attempt(powers, logarithms) {
  return {
    score: powers + logarithms + 4,
    total: 8,
    byTopic: {
      powers: { correct: powers, total: 2 },
      quadratic_equations: { correct: 2, total: 2 },
      logarithms: { correct: logarithms, total: 2 },
      functions: { correct: 2, total: 2 }
    }
  };
}

function snapshotPath(t) {
  const directory = mkdtempSync(join(tmpdir(), "timfy-progress-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return join(directory, "progress.json");
}

function saveSnapshot(path, first, latest) {
  writeFileSync(path, JSON.stringify({
    studentId: "student_demo_01",
    isDemo: true,
    attempts: { attempt_001: first, attempt_002: latest }
  }));
}

test("Compare two Firestore exports and keep only the remaining weak topic", t => {
  const path = snapshotPath(t);
  saveSnapshot(path, attempt(1, 0), attempt(2, 1));

  const result = get_student_progress(path);
  assert.deepEqual(result.first, { score: 5, total: 8 });
  assert.deepEqual(result.latest, { score: 7, total: 8 });
  assert.equal(result.scoreChange, 2);
  assert.deepEqual(result.previousWeakTopics, ["logarithms", "powers"]);
  assert.deepEqual(result.remainingWeakTopics, ["logarithms"]);
  assert.equal(result.recommendedTopic, "logarithms");
});

test("Change the practice topic when a different weakness remains", t => {
  const path = snapshotPath(t);
  saveSnapshot(path, attempt(1, 0), attempt(1, 2));

  const result = get_student_progress(path);
  assert.deepEqual(result.remainingWeakTopics, ["powers"]);
  assert.equal(result.recommendedTopic, "powers");
});

test("Do not recommend a weak topic when all topics meet the threshold", t => {
  const path = snapshotPath(t);
  saveSnapshot(path, attempt(1, 0), attempt(2, 2));

  assert.equal(get_student_progress(path).recommendedTopic, null);
});

test("Reject a missing snapshot and inconsistent scores", t => {
  const path = snapshotPath(t);
  assert.throws(() => get_student_progress(path), /snapshot missing/);

  saveSnapshot(path, attempt(1, 0), { ...attempt(2, 1), score: 8 });
  assert.throws(() => get_student_progress(path), /score does not match/);
});

test("Do not accept a student ID or file path from the model", () => {
  assert.deepEqual(validateToolCall("get_student_progress", {}), {});
  assert.throws(() => validateToolCall("get_student_progress", {
    studentId: "another_student"
  }), /Unexpected arguments/);
});
