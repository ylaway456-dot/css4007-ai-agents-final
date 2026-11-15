import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const grader = fileURLToPath(
  new URL("../src/grade_submission.mjs", import.meta.url)
);

const demoAnswers = [0, 1, 1, 2, 1, 1, 2, 3].map((answer, index) => ({
  id: index + 1,
  answer
}));

function grade(answers) {
  const run = spawnSync(process.execPath, [grader], {
    input: JSON.stringify(answers),
    encoding: "utf8"
  });
  assert.ifError(run.error);
  return run;
}

test("Quiz submission returns the correct score and topic totals as JSON", () => {
  const run = grade(demoAnswers);

  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), {
    score: 7,
    total: 8,
    byTopic: {
      powers: { correct: 1, total: 2 },
      quadratic_equations: { correct: 2, total: 2 },
      logarithms: { correct: 2, total: 2 },
      functions: { correct: 2, total: 2 }
    }
  });
});

test("Quiz submission rejects a repeated question ID", () => {
  const run = grade([...demoAnswers.slice(0, -1), demoAnswers[0]]);

  assert.equal(run.status, 1);
  assert.match(run.stderr, /Invalid student answer/);
  assert.equal(run.stdout, "");
});

test("Quiz submission rejects an answer outside the available options", () => {
  const run = grade([{ ...demoAnswers[0], answer: 4 }, ...demoAnswers.slice(1)]);

  assert.equal(run.status, 1);
  assert.match(run.stderr, /Invalid student answer/);
  assert.equal(run.stdout, "");
});

test("Quiz submission rejects missing answers", () => {
  const run = grade(demoAnswers.slice(0, -1));

  assert.equal(run.status, 1);
  assert.match(run.stderr, /Invalid number of answers/);
  assert.equal(run.stdout, "");
});
