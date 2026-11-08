import { questionBank } from "./question_bank.mjs";

// Tool: check student answers
export function check_student_answers(studentAnswers) {

  // Validate the number of answers
  if (!Array.isArray(studentAnswers) ||
      studentAnswers.length !== questionBank.length) {
    throw new Error("Invalid number of answers.");
  }

  let score = 0;
  const mistakes = [];
  const byTopic = {};
  const usedIds = new Set();

  for (const student of studentAnswers) {

    // Find the question
    const question = questionBank.find(q => q.id === student.id);

    // Validate the answer
    if (!question ||
        usedIds.has(student.id) ||
        !Number.isInteger(student.answer) ||
        student.answer < 0 ||
        student.answer >= question.options.length) {
      throw new Error("Invalid student answer.");
    }

    usedIds.add(student.id);

    // Create topic statistics
    if (!byTopic[question.topic]) {
      byTopic[question.topic] = {
        correct: 0,
        total: 0
      };
    }

    byTopic[question.topic].total++;

    // Check the answer
    if (student.answer === question.correctAnswer) {
      score++;
      byTopic[question.topic].correct++;
    } else {
      mistakes.push({
        questionId: question.id,
        topic: question.topic,
        studentAnswer: question.options[student.answer],
        correctAnswer: question.options[question.correctAnswer]
      });
    }
  }

  return {
    score,
    total: questionBank.length,
    byTopic,
    mistakes
  };
}
