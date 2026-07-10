from datetime import datetime

MONTH_CODES = {
    1: "A", 2: "B", 3: "C", 4: "D",
    5: "E", 6: "F", 7: "G", 8: "H",
    9: "I", 10: "J", 11: "K", 12: "L",
}


def generate_unique_id(track_code: str, application_number: int, created_at: datetime = None) -> str:
    if created_at is None:
        created_at = datetime.utcnow()
    month_code = MONTH_CODES[created_at.month]
    year_code = str(created_at.year % 100).zfill(2)
    track_padded = track_code.zfill(2)
    app_padded = str(application_number).zfill(4)
    return f"A1{month_code}{year_code}{track_padded}{app_padded}"
