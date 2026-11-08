
import { practiceBank } from "./practice_bank.mjs";

// Verify questions returned by a tool
export function verifyPracticeOutput(questions) {

  if (!Array.isArray(questions)) {
    throw new Error("Invalid practice output.");
  }

  const verified = [];
  const usedIds = new Set();

  for (const question of questions) {

    if (!question || typeof question !== "object" ||
        Array.isArray(question)) {
      throw new Error("Invalid question format.");
    }

    // Only approved fields are allowed
    const allowedFields = [
      "id", "topic", "difficulty", "question", "options"
    ];

    const fields = Object.keys(question);

    if (fields.length !== allowedFields.length ||
        !fields.every(field => allowedFields.includes(field))) {
      throw new Error("Unexpected content in tool output.");
    }

    // Find original question in trusted database
    const original = practiceBank.find(
      q => q.id === question.id
    );

    if (!original || usedIds.has(question.id)) {
      throw new Error("Unknown or duplicate question.");
    }

    // Check that the question was not modified
    if (question.topic !== original.topic ||
        question.difficulty !== original.difficulty ||
        question.question !== original.question ||
        JSON.stringify(question.options) !==
        JSON.stringify(original.options)) {
      throw new Error("Untrusted practice content.");
    }

    usedIds.add(question.id);

    // Return only verified data without answer keys
    verified.push({
      id: original.id,
      topic: original.topic,
      difficulty: original.difficulty,
      question: original.question,
      options: [...original.options]
    });
  }

  return verified;
}
