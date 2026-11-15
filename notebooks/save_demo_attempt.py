"""Save the Colab demo submission and refresh the agent's progress snapshot."""

import json
import subprocess
from pathlib import Path

from google.api_core.exceptions import Conflict
from google.cloud import firestore


def save_demo_attempt(db, project, snapshot_path, answers):
    student_id = "student_demo_01"
    student_ref = db.collection("timfyAiDemo").document(student_id)
    student = student_ref.get()
    if not student.exists or student.to_dict().get("isDemo") is not True:
        raise ValueError("The demo student is missing.")

    submission = [
        {"id": question_id, "answer": choice}
        for question_id, choice in enumerate(answers, start=1)
    ]
    scored = subprocess.run(
        ["node", "src/grade_submission.mjs"],
        cwd=project,
        input=json.dumps(submission),
        text=True,
        stdout=subprocess.PIPE,
        check=True,
    )
    result = json.loads(scored.stdout)

    attempts = student_ref.collection("attempts")
    attempt_ref = attempts.document("attempt_003")
    record = {
        **result,
        "testNumber": 3,
        "isDemo": True,
    }

    try:
        attempt_ref.create({**record, "createdAt": firestore.SERVER_TIMESTAMP})
        print("Saved attempt_003 to Firestore.")
    except Conflict:
        print("attempt_003 already exists. Checking the saved result.")

    saved = attempt_ref.get().to_dict() or {}
    if any(saved.get(key) != value for key, value in record.items()):
        raise ValueError("The saved attempt does not match this demo submission.")

    recent_attempts = {}
    for attempt in attempts.order_by(
        "testNumber", direction=firestore.Query.DESCENDING
    ).limit(2).stream():
        data = attempt.to_dict()
        if data.get("isDemo") is not True:
            raise ValueError("Only demo attempts can be exported.")
        recent_attempts[attempt.id] = {
            field: data[field] for field in ("score", "total", "byTopic")
        }

    if len(recent_attempts) < 2:
        raise ValueError("At least two demo attempts are needed for comparison.")

    snapshot_path = Path(snapshot_path)
    snapshot_path.write_text(json.dumps({
        "studentId": student_id,
        "isDemo": True,
        "attempts": recent_attempts,
    }, indent=2), encoding="utf-8")
    print(f"Score: {result['score']}/{result['total']}")
    print("Exported attempts:", ", ".join(recent_attempts))
