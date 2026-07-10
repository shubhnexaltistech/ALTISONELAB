from app.utils.unique_id import generate_unique_id
from datetime import datetime


def test_unique_id_format():
    uid = generate_unique_id("01", 42, datetime(2026, 7, 15))
    assert uid == "A1G26010042"


def test_unique_id_january():
    uid = generate_unique_id("03", 1, datetime(2026, 1, 5))
    assert uid == "A1A26030001"
