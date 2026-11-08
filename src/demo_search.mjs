
import { check_student_answers } from "./check_answers.mjs";
import { analyze_mistakes } from "./analyze_mistakes.mjs";
import { search_question_bank } from "./search_question_bank.mjs";

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

// Check student answers
const results = check_student_answers(studentAnswers);

// Find weak topics
const analysis = analyze_mistakes(results);

// Select practice questions
const topic = analysis.recommendedTopic;

if (topic) {
  const practice = search_question_bank({
    topic: topic,
    difficulty: "any",
    limit: 2
  });

  console.log("Recommended topic:", topic);
  console.log("\nPersonalized practice:");
  console.log(JSON.stringify(practice, null, 2));
} else {
  console.log("No weak topics detected.");
}
