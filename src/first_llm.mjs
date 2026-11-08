import OpenAI from "openai";

// Connect to OpenAI
const client = new OpenAI();

// Student question
const question = "Solve 2^(x+1) = 16";

try {
  // Send the question to the model
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions: `You are Timfy AI, a mathematics tutor.
    Help Grade 11 students prepare for the UNT exam.
    Explain mathematical solutions step by step in Russian.
    Use simple and clear language.`,
    input: question
  });

  // Show the result
  console.log("Student question:", question);
  console.log("\nTimfy AI answer:");
  console.log(response.output_text);

} catch (error) {
  console.error("API error:", error.message);
}
