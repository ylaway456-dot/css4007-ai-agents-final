
// Tool: analyze weak mathematics topics
export function analyze_mistakes(testResults) {

  if (!testResults || !testResults.byTopic) {
    throw new Error("Invalid test results.");
  }

  const topicAnalysis = [];

  // Analyze each topic
  for (const [topic, stats] of Object.entries(testResults.byTopic)) {

    if (!Number.isInteger(stats.correct) ||
        !Number.isInteger(stats.total) ||
        stats.total <= 0 ||
        stats.correct < 0 ||
        stats.correct > stats.total) {
      throw new Error("Invalid topic statistics.");
    }

    const accuracy = (stats.correct / stats.total) * 100;

    topicAnalysis.push({
      topic: topic,
      correct: stats.correct,
      total: stats.total,
      accuracy: accuracy,
      needsPractice: accuracy < 75
    });
  }

  // Sort topics from weakest to strongest
  topicAnalysis.sort((a, b) => a.accuracy - b.accuracy);

  // Find weak topics
  const weakTopics = topicAnalysis.filter(t => t.needsPractice);

  return {
    topicAnalysis,
    weakTopics,
    recommendedTopic: weakTopics.length > 0
      ? weakTopics[0].topic
      : null
  };
}
