
import { practiceBank } from "./practice_bank.mjs";

// Tool: search practice questions
export function search_question_bank({
  topic,
  difficulty = "any",
  limit = 2
}) {

  // Validate topic
  const allowedTopics = [...new Set(practiceBank.map(q => q.topic))];

  if (!allowedTopics.includes(topic)) {
    throw new Error("Unknown mathematics topic.");
  }

  // Validate difficulty
  if (!["any", "easy", "medium"].includes(difficulty)) {
    throw new Error("Invalid difficulty.");
  }

  // Validate question limit
  if (!Number.isInteger(limit) || limit < 1 || limit > 5) {
    throw new Error("Limit must be between 1 and 5.");
  }

  // Search for matching questions
  const matches = practiceBank.filter(q =>
    q.topic === topic &&
    (difficulty === "any" || q.difficulty === difficulty)
  );

  // Return questions without correct answers
  return matches.slice(0, limit).map(q => ({
    id: q.id,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options
  }));
}
