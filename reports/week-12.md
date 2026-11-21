# Semester Week 12 Progress Report

## Completed Work

I updated the Colab notebook to load the two most recent demo attempts from Firestore. I restarted Colab and verified that Timfy AI could compare the saved attempts and recommend practice.

## Important Commits

- [4ef856c](https://github.com/ylaway456-dot/css4007-ai-agents-final/commit/4ef856c2158e1b9b79dfb60aec62bbf27c40ccab) — Quiz submission tests added on 15 November. I used this version as the starting point for Week 12.

## Current Functionality

Timfy AI compared attempt 003 (7/8) with attempt 004 (1/8). It selected quadratic equations and returned practice questions 103 and 104. The run ended with `Verified completion: true`.

## Problems Encountered

The original export loaded attempts 001 and 002 every time. After restarting Colab, I also had to restore the Firebase connection and replace the expired OpenAI API key.

## Solutions

I changed the export to sort attempts by test number and load the latest two. I updated the API key in Colab Secrets and verified that the agent ran successfully in the new session. The repository test suite passed all 35 tests.

## What I Learned

The agent recommends practice based on results by topic. I also learned how to use the execution trace to check which tools the model called and what it passed to them.

## Next Week

I plan to document the tools and their permissions and verify how the agent chooses tools for different requests.
