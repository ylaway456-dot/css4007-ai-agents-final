import { readFileSync } from "node:fs";
import { analyze_mistakes } from "./analyze_mistakes.mjs";
import { questionBank } from "./question_bank.mjs";

const topics = [...new Set(questionBank.map(question => question.topic))];

function validateAttempt(attempt) {
  if (!attempt?.byTopic ||
      Object.keys(attempt.byTopic).length !== topics.length) {
    throw new Error("The demo attempt must include all diagnostic topics.");
  }

  const byTopic = {};
  let score = 0;
  let total = 0;

  for (const topic of topics) {
    const stats = attempt.byTopic[topic];
    if (!Number.isSafeInteger(stats?.correct) ||
        !Number.isSafeInteger(stats?.total) ||
        stats.total < 1 ||
        stats.correct < 0 ||
        stats.correct > stats.total) {
      throw new Error("Invalid topic statistics in the progress snapshot.");
    }
    byTopic[topic] = { correct: stats.correct, total: stats.total };
    score += stats.correct;
    total += stats.total;
  }

  if (!Number.isSafeInteger(total) ||
      score !== attempt.score || total !== attempt.total) {
    throw new Error("The snapshot score does not match its topic statistics.");
  }

  return { score, total, byTopic };
}

export function get_student_progress(snapshotPath) {
  if (!snapshotPath) {
    throw new Error("Set TIMFY_PROGRESS_SNAPSHOT to the JSON exported from Firestore.");
  }

  let snapshot;
  try {
    const file = readFileSync(snapshotPath, "utf8");
    snapshot = JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("Progress snapshot missing. Run the Firestore export cell in Colab.");
    }
    throw new Error("The progress snapshot could not be read as JSON.");
  }

  if (snapshot?.isDemo !== true || snapshot.studentId !== "student_demo_01") {
    throw new Error("Only the configured demo student's snapshot is allowed.");
  }

  const first = validateAttempt(snapshot.attempts?.attempt_001);
  const latest = validateAttempt(snapshot.attempts?.attempt_002);

  if (topics.some(topic => first.byTopic[topic].total !== latest.byTopic[topic].total)) {
    throw new Error("These demo attempts must have the same question count for each topic.");
  }

  const firstAnalysis = analyze_mistakes(first);
  const latestAnalysis = analyze_mistakes(latest);
  const topicChanges = topics.map(topic => ({
    topic,
    previous: first.byTopic[topic],
    latest: latest.byTopic[topic]
  }));

  return {
    first: { score: first.score, total: first.total },
    latest: { score: latest.score, total: latest.total },
    scoreChange: latest.score - first.score,
    topicChanges,
    improvedTopics: topicChanges
      .filter(change => change.latest.correct > change.previous.correct)
      .map(change => change.topic),
    previousWeakTopics: firstAnalysis.weakTopics.map(item => item.topic),
    remainingWeakTopics: latestAnalysis.weakTopics.map(item => item.topic),
    recommendedTopic: latestAnalysis.recommendedTopic
  };
}
