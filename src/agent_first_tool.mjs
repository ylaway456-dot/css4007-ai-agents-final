
import OpenAI from "openai";
import { search_question_bank } from "./search_question_bank.mjs";

const client = new OpenAI();

// Describe the tool to the LLM
const tools = [
  {
    type: "function",
    name: "search_question_bank",
    description: "Find mathematics practice questions by topic and difficulty.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: [
            "powers",
            "quadratic_equations",
            "logarithms",
            "functions"
          ]
        },
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "any"]
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 5
        }
      },
      required: ["topic", "difficulty", "limit"],
      additionalProperties: false
    }
  }
];

// Student request
const question =
  "Подбери мне 2 задания по логарифмам разной сложности, без ответов.";

const instructions = `
You are Timfy AI, a mathematics assistant for UNT students.
Answer in Russian.
Use search_question_bank when students ask for practice questions.
Never invent questions or correct answers.
Do not reveal answer keys.
`;

try {
  // Step 1: Let the model choose a tool
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions,
    input: question,
    tools,
    tool_choice: "auto",
    parallel_tool_calls: false
  });

  const calls = response.output.filter(
    item => item.type === "function_call"
  );

  console.log("Student:", question);

  if (calls.length === 0) {
    console.log("\nNo tool selected.");
    console.log(response.output_text);
  } else {
    const input = [
      { role: "user", content: question },
      ...response.output
    ];

    // Step 2: Execute the tool selected by the LLM
    for (const call of calls.slice(0, 1)) {
      console.log("\nSelected tool:", call.name);

      let result;

      try {
        if (call.name !== "search_question_bank") {
          throw new Error("Tool not allowed.");
        }

        const args = JSON.parse(call.arguments);
        console.log("Tool arguments:", args);

        result = search_question_bank(args);

      } catch (error) {
        result = { error: error.message };
      }

      console.log("Tool result:", JSON.stringify(result));

      input.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result)
      });
    }

    // Step 3: Give tool results back to the model
    const finalResponse = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions,
      input,
      tools,
      tool_choice: "none"
    });

    console.log("\nTimfy AI final answer:");
    console.log(finalResponse.output_text);
  }

} catch (error) {
  console.error("Agent error:", error.message);
  process.exitCode = 1;
}
