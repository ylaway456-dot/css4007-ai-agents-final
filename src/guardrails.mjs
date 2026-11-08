
// List of allowed tools
const allowedTools = [
  "get_test_results",
  "analyze_mistakes",
  "search_question_bank"
];

const allowedTopics = [
  "powers",
  "quadratic_equations",
  "logarithms",
  "functions"
];

// Validate every tool call
export function validateToolCall(name, args) {

  // Check tool permission
  if (!allowedTools.includes(name)) {
    throw new Error("Tool is not allowed.");
  }

  // Check argument format
  if (args === null ||
      typeof args !== "object" ||
      Array.isArray(args)) {
    throw new Error("Invalid tool arguments.");
  }

  // These tools do not accept arguments
  if (name === "get_test_results" ||
      name === "analyze_mistakes") {

    if (Object.keys(args).length !== 0) {
      throw new Error("Unexpected arguments.");
    }

    return args;
  }

  // Validate question search arguments
  const required = ["topic", "difficulty", "limit"];

  if (Object.keys(args).length !== 3 ||
      !required.every(key => Object.hasOwn(args, key))) {
    throw new Error("Invalid search parameters.");
  }

  if (!allowedTopics.includes(args.topic)) {
    throw new Error("Invalid mathematics topic.");
  }

  if (!["easy", "medium", "any"].includes(args.difficulty)) {
    throw new Error("Invalid difficulty.");
  }

  if (!Number.isInteger(args.limit) ||
      args.limit < 1 ||
      args.limit > 5) {
    throw new Error("Invalid question limit.");
  }

  return args;
}
