import { readFileSync } from "node:fs";
import { check_student_answers } from "./check_answers.mjs";

try {
  const answers = JSON.parse(readFileSync(0, "utf8"));
  const { score, total, byTopic } = check_student_answers(answers);
  console.log(JSON.stringify({ score, total, byTopic }));
} catch (error) {
  console.error(`Could not grade submission: ${error.message}`);
  process.exitCode = 1;
}
