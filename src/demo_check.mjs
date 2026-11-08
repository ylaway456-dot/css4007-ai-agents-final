import { check_student_answers } from "./check_answers.mjs";

// Sample answers from one student
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

const result = check_student_answers(studentAnswers);

console.log("Student Test Results:");
console.log(JSON.stringify(result, null, 2));
