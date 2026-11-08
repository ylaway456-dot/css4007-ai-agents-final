
import { check_student_answers } from "./check_answers.mjs";
import { analyze_mistakes } from "./analyze_mistakes.mjs";

// Sample student answers
const studentAnswers = [
  { id: 1, answer: 0 },
  { id: 2, answer: 1 },
  { id: 3, answer: 1 },
  { id: 4, answer: 2 },
  { id: 5, answer: 0 },
  { id: 6, answer: 2 },
  { id: 7, answer: 2 },
  { id: 8, answer: 3 }
];

// Step 1: Check answers
const testResults = check_student_answers(studentAnswers);

// Step 2: Analyze mistakes
const analysis = analyze_mistakes(testResults);

// Show results
console.log("Student score:", testResults.score, "/", testResults.total);

console.log("\nWeak topics:");
console.log(JSON.stringify(analysis.weakTopics, null, 2));

console.log("\nRecommended topic:");
console.log(analysis.recommendedTopic);
