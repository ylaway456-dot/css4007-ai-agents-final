# Project Proposal — Semester Week 10

## Project Title

**Timfy AI: An Autonomous Error Analysis and Adaptive Practice Agent for UNT Mathematics Preparation**

UNT (Unified National Testing, also called ENT / ЕНТ) is the university entrance exam in Kazakhstan.

## Problem Description

Many Grade 11 students prepare for the UNT by solving many mathematics tests. A normal test platform shows the total score and correct answers, but a student may still not understand *which topics* cause repeated mistakes and *what to practice next*. The student can spend time on random questions instead of improving weak topics.

I want to create an AI learning agent that uses a student's real test results to detect weak mathematics topics and plan the next practice session. The agent will not just give a general chatbot answer. It will select tools, check available data, make a learning plan, and adapt the plan when new test results arrive.

The agent will be part of my educational project **Timfy**. For the university submission, I will first build a standalone working UNT module in my required GitHub fork. Integration with my existing website, https://studywithtimfy.web.app/, is a later improvement, not a dependency for the final demonstration. The existing website focuses on NIS preparation, while this project focuses on Grade 11 UNT mathematics.

The system is a *study assistant*, not an official UNT exam platform. It cannot guarantee an exam score.

## Target Users

- **Primary users:** Grade 11 students in Kazakhstan preparing for the UNT mathematics profile subject.
- **Secondary users:** mathematics tutors who want to see which topics need more practice.
- **Development and demo:** anonymous sample student profiles and teacher-reviewed mathematics questions. I will not need real student names, phone numbers, or private school records.

## Selected Difficulty

A — Advanced: Autonomous Multi-Step Agent.

I plan to satisfy D and C requirements and build one agent with at least three meaningful LLM-callable tools, real multi-step execution, explicit state, planning, adaptation, bounded execution, guardrails, execution logs, at least twelve tests (including the four required guardrail scenarios), and a recent research paper presentation.

I will demonstrate these capabilities in the working application, not only describe them in the report. One agent is sufficient; I do not need a multi-agent framework just for complexity.

## Expected Functionality

**Main user workflow**

1. A student completes a short diagnostic mathematics test or opens previously saved practice results.
2. The application checks the submitted answers against a **teacher-reviewed question bank**. Correctness and scores come from code and stored answer keys, not from an LLM guess.
3. The student asks the agent for help, for example, "Analyze my mistakes and choose what I should practice next."
4. The LLM selects appropriate tools. It can read previous attempts, calculate topic error statistics, find matching questions, and look up a short lesson.
5. The agent proposes a personalized practice set and a small study plan, with a clear explanation based on actual test data.
6. The student may approve saving the plan. The application must check that approval in code before any write action.
7. After another student-submitted test, the agent compares the new results with the earlier attempt and can revise its recommendation.

**First-version scope (minimum viable product)**

- Profile mathematics only, with four initial topics: powers/exponents, quadratic equations, logarithms, and functions.
- Approximately 40–60 manually checked multiple-choice questions with topic, difficulty, correct answer, and optional mistake category.
- A diagnostic test (about 10–12 questions) and short adaptive practice sets (for example, 5 questions).
- A simple local web interface, a student's results page, and an agent conversation/feedback area.
- Transparent recommendations such as "Logarithms: 2 correct out of 5", not invented performance numbers.
- A visible short action trace for the final defense, without private chain-of-thought or API secrets.
- Anonymous demo sessions and a small database for attempts, plans, and agent state.

**Out of scope for this semester:** full UNT coverage, all school subjects, OCR of handwritten work, official UNT score prediction, production student accounts, payment functionality, and replacing the existing Timfy website.

## Proposed Functions

The following is a preliminary design. I may rename a function during development, but I will keep the same responsibilities.

| Function name | Purpose | Inputs | Expected output | Dependencies |
|---|---|---|---|---|
| `validate_submission(answers)` | Reject invalid answer formats and unknown question IDs before grading | Map of question IDs to chosen answer options | Validated answer map or validation error | Question schema, approved question IDs |
| `grade_attempt(session_id, answers)` | Check answers using stored answer keys and record a student-submitted attempt | Server session ID; validated answers after the student clicks **Submit** | Score, result per question, stored attempt ID | Question bank, database, `validate_submission` |
| `get_attempt_history(session_id, limit)` | Read previous results for the current demo student | Server-scoped session ID; bounded limit | List of attempts and question/topic outcomes, or empty list | Database; session authorization |
| `analyze_mistakes(attempt_ids)` | Calculate errors by topic, repeated mistake categories, and change between attempts | IDs of permitted attempts belonging to current session | Topic accuracy, ranked weak topics, comparison metrics | Attempt records, tagged question bank, input validation |
| `search_question_bank(topic, difficulty, count, exclude_ids)` | Find suitable unused practice questions | Allowed topic, easy/medium/hard, number of questions, excluded IDs | Question IDs, text, options, topic and difficulty; **no hidden answer key** | Verified question bank, filters |
| `get_topic_lesson(topic)` | Find a brief explanation with a worked example from trusted content | Allowed topic name | Lesson title, explanation, example, or not-found status | Reviewed local lesson data |
| `save_study_plan(session_id, plan, approval_id)` | Save the suggested plan **only if the user has explicitly approved it** | Session ID, validated plan, short-lived server approval ID | Saved plan ID and success status, or rejected operation | Approval store, database, authorization policy |
| `run_agent(goal, session_id)` | Control the multi-step agent loop, tool calls, state and stopping conditions | User goal and server-scoped session | Verified recommendation, updated agent state, trace and completion status | OpenAI API, tool registry, state store, guardrails |

`grade_attempt` is a normal application function, triggered by the student's Submit button. It is **not** a free-form model-controlled way to change scores. The LLM-callable functions are specified below.

## Proposed Agent Tools

The LLM will be able to choose from **five registered tools**:

1. **`get_attempt_history` — read-only.** The agent needs real previous attempts before it can make claims about student progress. The backend uses the authenticated/current demo session; the model cannot choose another student's ID.
2. **`analyze_mistakes` — read-only analysis.** It calculates weak topics and improvement from verified results. This avoids relying on the model for arithmetic or inventing scores.
3. **`search_question_bank` — read-only.** The agent finds real available questions with the requested topic and difficulty instead of making up task IDs. The tool hides answer keys until the student submits answers.
4. **`get_topic_lesson` — read-only.** It finds reviewed theory for a weak topic. The agent may use it when a student needs explanation, or skip it when only questions are requested.
5. **`save_study_plan` — restricted write.** A student can explicitly approve saving a proposed plan. The backend checks session ownership and a one-time approval record before allowing the write. A model instruction alone never counts as approval.

All tool arguments will be validated against schemas and allowlists. The LLM chooses which tool to call and in what order based on observations. The program does **not** always execute a fixed hard-coded list. For example, if no test history exists, the agent should ask the student to take the diagnostic test rather than invent a personal analysis. If question search returns too few items, the agent can choose another allowed difficulty or return a partial result.

## Model Selection

I plan to use **OpenAI GPT-4.1 mini through the OpenAI Responses API** for tool selection, planning, and student-friendly explanations. The API supports function/tool calling. The selected model ID will be kept configurable in an environment variable so I can switch to another available tool-capable model if needed. No API key will be stored in GitHub or sent to the browser.

I will use **JavaScript / Node.js 22** (the instructor's starter repository already uses Node.js), with a small browser interface and server-side API. I plan to use a lightweight local database such as SQLite for attempts, question metadata, plans, and state. A manually reviewed question bank is more reliable for grading than free-form LLM-generated solutions.

For automated tests I will use mock LLM responses and mock tool failures, so most tests can run without paying for API calls. A few documented integration tests will use the real model during development if API access is available.

## Architecture

```text
Student / Teacher Demo
         |
         v
Web interface: diagnostic test, results, AI Coach, practice
         |
         v
Node.js backend (server session, grading, validated API)
         |
         +----> Trusted answer checker ----> SQLite attempts
         |
         v
Agent controller -> explicit state / plan / limits / trace
         |
         v
OpenAI Responses API (LLM chooses the next action)
         |
         v
Tool dispatcher + argument validation + permission checks
         |
         +-- get_attempt_history --> SQLite attempts
         +-- analyze_mistakes  --> Verified attempt statistics
         +-- search_question_bank --> Reviewed question bank
         +-- get_topic_lesson --> Reviewed lessons
         +-- save_study_plan --> Approval check --> SQLite plan
         |
         v
Tool observation -> update state -> decide next tool / replan / stop
         |
         v
Verified student feedback and next practice set
```

**Explicit execution state:** `goal`, `session_id`, `stage`, `step_count`, `tool_call_count`, `selected_tools`, `observations`, `weak_topics`, `recommended_question_ids`, `draft_plan`, `approval_status`, `error_count`, and `stop_reason`.

**Autonomous decision example:** When the agent sees repeated errors in logarithms, it can choose logarithm questions. After a later test, if logarithm accuracy improves but functions remain weak, the next plan can change to functions. The model selects actions, but verified calculations and permission checks remain deterministic backend logic.

**Reliability and safety plan:** Maximum 8 agent steps, maximum 12 tool calls, maximum 2 retries per failed tool, request timeouts, and explicit termination reasons such as `completed`, `needs_diagnostic`, `needs_approval`, `tool_unavailable`, or `limit_reached`. These are proposed defaults and can be adjusted after testing.

**Guardrails:** Validate all tool arguments; derive student identity from the server session; never expose keys or answer keys to an active test; treat question and lesson text as data rather than instructions; never follow tool-output requests to change system rules; require explicit approval for saving plans; protect log privacy; never claim a test was graded if the grader did not return a result.

## Example Requests

1. **"I finished the test. Analyze my mistakes and tell me what topic I should study first."** The agent reads the student's attempts, analyzes topic errors, gets the right lesson and questions, and proposes a short plan.
2. **"Give me five medium-level tasks on logarithms, but do not show the answers yet."** The agent finds five valid, unused questions in the bank and returns them without answer keys.
3. **"My last result was better than my first one. Should I move to a harder level?"** The agent compares two available attempts; if results are not sufficient, it says so rather than claiming improvement.
4. **"I have no test history. Make me a personalized plan."** The agent recognizes the missing data and offers a diagnostic test before making personal claims.
5. **"Save this plan for me."** The agent prepares the write action but the backend performs it only after the student has approved the plan.

## Evaluation Plan

I plan **at least 12 documented tests**. The first eight test core functions and decision-making. The final four cover the required A-level guardrail scenarios. I will document input, expected behavior, actual behavior, pass/fail, and evidence from action traces.

| # | Test scenario | Expected result |
|---|---|---|
| 1 | Valid diagnostic answers | Correct deterministic score and saved attempt |
| 2 | Invalid answer option or question ID | Input rejected before grading |
| 3 | Student has no previous results | Agent asks for diagnostic; no invented weak topics |
| 4 | Student has repeated errors in powers | Agent identifies powers using real attempt data |
| 5 | User asks only for practice questions | LLM selects question-search tool; not an unnecessary fixed workflow |
| 6 | User asks for explanation of logarithms | Agent selects reviewed lesson, with no invented citation |
| 7 | Student improved between two attempts | Agent compares actual results and changes or justifies its plan |
| 8 | Question search returns too few questions | Agent adapts within allowed scope or reports partial result |
| 9 | **Prompt injection in question/lesson content** | Agent ignores malicious instructions in untrusted data; no unauthorized action |
| 10 | **Repeated tool failure** | Bounded retries, useful error, correct failed/partial status |
| 11 | **Unauthorized/unapproved save attempt** | Permission check denies write even if LLM asks for it |
| 12 | **Execution limit reached** | Agent stops on step/tool-call limit and records the stopping reason |

I will also compare generated recommendations with a small teacher-labeled expected set, checking **topic correctness**, **question relevance**, **valid tool use**, **absence of fabricated scores**, and **successful safe stopping**. I will report counts and failure examples, not invent accuracy percentages in advance.

For the final defense I will demonstrate (a) one successful end-to-end multi-step run, (b) a different request that requires another tool sequence, and (c) at least one failed or malicious scenario that is safely handled. I will save concise observable action traces and test evidence in the repository.

**A-level research paper:** I will select a genuine technical LLM/agent paper first released between 22 June and 22 December 2026, document the selection in `reports/paper-selection.md` during Week 14, and prepare the required 5–7 minute explanation with method, evaluation, results, limitations, and one technical figure or experiment.

## Weekly Milestones

| Week | Dates (2026) | Planned work and evidence |
|---|---|---|
| **10** | **Nov 2–8** | Fork instructor repository; inspect A-level rubric; define realistic topic scope, preliminary functions, architecture, evaluation plan; submit `reports/proposal.md`; begin `reports/week-10.md`; commit genuine planning work. |
| **11** | **Nov 9–15** | Set up Node.js project and API configuration; test first real OpenAI request; create basic agent endpoint and README instructions; commit initial code. |
| **12** | **Nov 16–22** | Create reviewed questions and lessons, validation, automatic grading, attempt storage, and first tests. |
| **13** | **Nov 23–29** | Implement at least three LLM-callable tools, tool schemas/validation, actual LLM tool selection, and execution logs; add distinct tool-use tests. |
| **14** | **Nov 30–Dec 6** | Build full iterative agent loop with state, planning, conditional decisions, replanning, stopping conditions, and end-to-end demo; select and document recent research paper. |
| **15** | **Dec 7–13** | Implement approval checks, session scoping, retries, limits, prompt-injection defense, safe errors, and required guardrail tests. |
| **16** | **Dec 14–20** | Run at least twelve tests, improve failures, document evaluation, prepare application demonstration and paper slides. |
| **17** | **Dec 21–22** | Final report, source/code review, demo, paper presentation, final fork URL and commit hash; submit before 22 Dec 23:59 UTC+5. |

I will use GitHub commits and weekly reports to show real progress. I understand that meaningful work across Weeks 10–17 affects the development-consistency coefficient. The existing website alone does not count as implementation of this AI agent; the new agent must be in the required course fork and demonstrated working.
