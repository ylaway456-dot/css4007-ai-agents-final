# Semester Week 11 Progress Report

## Completed Work

From 9 to 15 November 2026, I connected the Timfy AI Colab notebook to Cloud Firestore and saved two attempts for a demo student. I added an export cell that reads both attempts and creates a JSON snapshot in Colab. I then added the JavaScript tool `get_student_progress` and registered it with the existing agent. I added five tests for progress comparison, changed recommendations, complete topic coverage at the practice threshold, invalid or missing data, and tool permissions.

## Important Commits

- [`8564db3`](https://github.com/ylaway456-dot/css4007-ai-agents-final/commit/8564db31932e9c3f03ed21e5a81f142aff2bbbb4) — Saved the Colab notebook with the Firestore workflow, the demo attempts, and the JSON export.
- [`c23addd`](https://github.com/ylaway456-dot/css4007-ai-agents-final/commit/c23addd6ec6f4b8b845f0e01efb32cf9e6237825) — Added the progress tool and updated the agent and tool validation.
- [`1185178`](https://github.com/ylaway456-dot/css4007-ai-agents-final/commit/118517802bb89d59a414529f50f801fa5dcb132e) — Added automated tests for the new tool.

## Current Functionality

The prototype uses the OpenAI API for tool selection. The new progress tool reads two demo attempts from a JSON snapshot exported by Colab. The first demo score is 5/8 and the second is 7/8. Powers improved from 1/2 to 2/2, and logarithms improved from 0/2 to 1/2. Logarithms remain the recommended topic for practice. The JavaScript tool validates the stored scores and computes the recommendation from the latest attempt.

## Problems Encountered

The original agent had only one sample test result in its source code. The Firestore results were available in Python, so I needed to pass them to the JavaScript agent. Colab also clears its temporary files when the runtime resets.

## Solutions

I used a JSON export to pass the verified demo results from Python to JavaScript. The export cell can recreate the snapshot from Firestore in a new Colab session. The progress tool rejects missing files and inconsistent scores. The tool accepts no student ID or file path from the model. All 30 automated tests passed on a fresh checkout of the fork, including the five tests added this week.

## What I Learned

I learned how Firestore can keep student results between Colab sessions. I also learned to reuse the same topic analysis for both attempts and let the agent use the verified statistics to select a practice topic. I used ChatGPT to help draft and review the implementation and tests.

## Next Week

I plan to add a quiz submission flow. It will grade submitted answers, save the result as a new demo attempt, and let the agent use it to update the next practice recommendation.
