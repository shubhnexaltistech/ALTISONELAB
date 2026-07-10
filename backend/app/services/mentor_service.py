from app.models.user import User
from app.models.mentor_assignment import MentorAssignment


async def resolve_mentor_for_trainee(trainee: User) -> str | None:
    """Resolve mentor_id by trainee index within track (ordered by created_at)."""
    if not trainee.track_id:
        return None
    assignments = await MentorAssignment.find(
        MentorAssignment.track_id == trainee.track_id,
        MentorAssignment.is_active == True,
    ).to_list()
    if not assignments:
        return None
    trainees = await User.find(
        User.role == "trainee",
        User.track_id == trainee.track_id,
        User.is_active == True,
    ).sort(User.created_at).to_list()
    trainee_ids = [str(t.id) for t in trainees]
    try:
        idx = trainee_ids.index(str(trainee.id))
    except ValueError:
        return None
    for assignment in assignments:
        if assignment.start_idx <= idx <= assignment.end_idx:
            return assignment.mentor_id
    return None
