import OpenAI from "openai";
import { search_question_bank } from "./search_question_bank.mjs";

const client = new OpenAI();

const studentRequest =
  "Подбери мне 2 задания по логарифмам разной сложности, без ответов.";

const MAX_STEPS = 4;

// Describe the tool
const tools = [{
  type: "function",
  name: "search_question_bank",
  description: "Find practice questions by topic and difficulty.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: ["powers", "quadratic_equations",
               "logarithms", "functions"]
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
}];

// Store conversation and tool results
const history = [
  { role: "user", content: studentRequest }
];

const collectedQuestions = new Map();

try {
  for (let step = 1; step <= MAX_STEPS; step++) {

    const missing = ["easy", "medium"].filter(
      difficulty => !collectedQuestions.has(difficulty)
    );

    // Stop when the goal is completed
    if (missing.length === 0) {
      console.log("\nGoal completed!");
      break;
    }

    console.log(`\nAgent step ${step}`);
    console.log("Missing difficulties:", missing);

    // Let the LLM choose an action
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
        You are Timfy AI, a mathematics assistant.
        Answer in Russian.
        The student needs two logarithm questions:
        one easy and one medium.
        Use the search_question_bank tool.
        Do not invent questions or reveal answers.
        Continue searching until both difficulties are found.
        Current missing difficulties: ${missing.join(", ")}.
      `,
      input: history,
      tools,
      tool_choice: "auto",
      parallel_tool_calls: false
    });

    history.push(...response.output);

    const calls = response.output.filter(
      item => item.type === "function_call"
    );

    if (calls.length === 0) {
      console.log("The model did not select a tool.");
      break;
    }

    // Execute selected tool
    for (const call of calls) {

      let result;

      try {
        if (call.name !== "search_question_bank") {
          throw new Error("Unknown tool.");
        }

        const args = JSON.parse(call.arguments);

        console.log("Selected tool:", call.name);
        console.log("Arguments:", args);

        result = search_question_bank(args);

        // Save verified questions
        for (const question of result) {
          if (question.topic === "logarithms" &&
              ["easy", "medium"].includes(question.difficulty)) {
            collectedQuestions.set(
              question.difficulty,
              question
            );
          }
        }

      } catch (error) {
        result = { error: error.message };
      }

      // Return the tool result to the LLM
      history.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result)
      });
    }
  }

  // Verify the goal before showing results
  const easy = collectedQuestions.get("easy");
  const medium = collectedQuestions.get("medium");

  if (!easy || !medium) {
    console.log("\nGoal not fully completed.");
    console.log("The agent could not find both questions.");
    process.exitCode = 1;
  } else {
    console.log("\nTimfy AI — Personalized Practice");

    for (const q of [easy, medium]) {
      console.log(`\nQuestion ${q.id} (${q.difficulty})`);
      console.log(q.question);

      q.options.forEach((option, index) => {
        console.log(`${index + 1}. ${option}`);
      });
    }

    console.log("\nBoth questions were found successfully.");
  }

} catch (error) {
  console.error("Agent error:", error.message);
  process.exitCode = 1;
}
