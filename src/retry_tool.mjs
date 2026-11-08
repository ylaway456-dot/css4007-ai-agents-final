
// Run a tool with limited retries
export async function runToolWithRetry(toolFunction, maxRetries = 2) {

  if (typeof toolFunction !== "function") {
    throw new Error("Invalid tool function.");
  }

  if (!Number.isInteger(maxRetries) ||
      maxRetries < 0 || maxRetries > 3) {
    throw new Error("Invalid retry limit.");
  }

  const trace = [];

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await toolFunction();

      trace.push({
        attempt,
        status: "success"
      });

      return {
        success: true,
        result,
        attempts: attempt,
        trace
      };

    } catch (error) {

      const message = error instanceof Error
        ? error.message
        : "Unknown tool error";

      trace.push({
        attempt,
        status: "error",
        message
      });

      // Retry only temporary failures
      const temporary = error?.code === "TOOL_TEMPORARY_FAILURE";

      if (!temporary || attempt > maxRetries) {
        return {
          success: false,
          error: message,
          attempts: attempt,
          trace
        };
      }
    }
  }
}
