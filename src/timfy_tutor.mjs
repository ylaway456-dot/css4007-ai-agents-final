import OpenAI from "openai";

const client = new OpenAI();

// Get the question from the student
const question = process.argv.slice(2).join(" ").trim();

// Validate student input
if (question.length < 5 || question.length > 500) {
  console.error("Error: Question must contain 5-500 characters.");
  process.exit(1);
}

try {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions: `
      You are Timfy AI, a mathematics tutor for UNT students.
      Explain mathematics step by step in Russian.
      Use simple language for Grade 11 students.
      Give the final answer clearly.
      Use plain text instead of LaTeX formatting.
    `,
    input: question
  });

  if (!response.output_text) {
    throw new Error("The model returned an empty answer.");
  }

  console.log("Student:", question);
  console.log("\nTimfy AI:");
  console.log(response.output_text);

} catch (error) {
  console.error("Error:", error.message);
  process.exitCode = 1;
}
