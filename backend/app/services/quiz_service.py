from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import HTTPException
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt, AttemptAnswer
from app.models.trainee_progress import TraineeProgress
from app.models.module import Module


async def _is_module_unlocked(user_id: str, module_id: str) -> bool:
    module = await Module.get(module_id)
    if not module:
        return False
    if module.order == 1:
        return True
    progress = await TraineeProgress.find_one(
        TraineeProgress.user_id == user_id,
        TraineeProgress.module_id == module_id,
    )
    return bool(progress and progress.is_unlocked)


async def ensure_module_unlocked(user_id: str, module_id: str) -> None:
    if not await _is_module_unlocked(user_id, module_id):
        raise HTTPException(status_code=403, detail="Module is locked")


async def start_quiz(user_id: str, quiz_id: str) -> QuizAttempt:
    quiz = await Quiz.get(quiz_id)
    if not quiz or not quiz.is_active:
        raise HTTPException(status_code=404, detail="Quiz not found")
    await ensure_module_unlocked(user_id, quiz.module_id)
    last_failed = await QuizAttempt.find_one(
        QuizAttempt.user_id == user_id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.status == "failed",
        sort=[("submitted_at", -1)],
    )
    if last_failed and last_failed.submitted_at:
        cooldown_end = last_failed.submitted_at + timedelta(minutes=quiz.cooldown_mins)
        if datetime.now(timezone.utc) < cooldown_end:
            remaining = (cooldown_end - datetime.now(timezone.utc)).seconds // 60
            raise HTTPException(status_code=429, detail=f"Cooldown: {remaining} min remaining")
    existing = await QuizAttempt.find_one(
        QuizAttempt.user_id == user_id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.status == "in_progress",
    )
    if existing:
        return existing
    attempt = QuizAttempt(user_id=user_id, quiz_id=quiz_id, module_id=quiz.module_id)
    await attempt.insert()
    return attempt


async def submit_quiz(user_id: str, attempt_id: str, answers: List[dict]) -> QuizAttempt:
    attempt = await QuizAttempt.get(attempt_id)
    if not attempt or attempt.user_id != user_id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Already submitted")
    quiz = await Quiz.get(attempt.quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    elapsed = (datetime.now(timezone.utc) - attempt.started_at).total_seconds()
    if elapsed > (quiz.time_limit_mins * 60) + 30:
        attempt.status = "failed"
        attempt.score = 0
        attempt.submitted_at = datetime.now(timezone.utc)
        await attempt.save()
        raise HTTPException(status_code=400, detail="Time limit exceeded")
    total_points = 0
    earned_points = 0
    scored = []
    qmap = {q.id: q for q in quiz.questions}
    for ans in answers:
        q = qmap.get(ans["question_id"])
        if not q:
            continue
        total_points += q.points
        correct = sorted([i for i, o in enumerate(q.options) if o.is_correct])
        is_correct = sorted(ans["selected_options"]) == correct
        pts = q.points if is_correct else 0
        earned_points += pts
        scored.append(
            AttemptAnswer(
                question_id=ans["question_id"],
                selected_options=ans["selected_options"],
                is_correct=is_correct,
                points_earned=pts,
            )
        )
    pct = (earned_points / total_points * 100) if total_points > 0 else 0
    passed = pct >= quiz.passing_score
    attempt.answers = scored
    attempt.score = round(pct, 1)
    attempt.status = "passed" if passed else "failed"
    attempt.submitted_at = datetime.now(timezone.utc)
    await attempt.save()
    if passed:
        await _unlock_next(user_id, quiz.module_id)
    return attempt


async def _unlock_next(user_id: str, module_id: str):
    module = await Module.get(module_id)
    if not module:
        return
    progress = await TraineeProgress.find_one(
        TraineeProgress.user_id == user_id,
        TraineeProgress.module_id == module_id,
    )
    if progress:
        progress.quiz_passed = True
        progress.completed_at = datetime.now(timezone.utc)
        await progress.save()
    next_mod = await Module.find_one(
        Module.track_id == module.track_id,
        Module.order == module.order + 1,
    )
    if not next_mod:
        return
    np = await TraineeProgress.find_one(
        TraineeProgress.user_id == user_id,
        TraineeProgress.module_id == str(next_mod.id),
    )
    if not np:
        await TraineeProgress(
            user_id=user_id,
            module_id=str(next_mod.id),
            is_unlocked=True,
        ).insert()
    else:
        np.is_unlocked = True
        await np.save()
